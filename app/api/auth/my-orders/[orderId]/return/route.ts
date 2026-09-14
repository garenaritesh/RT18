import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ensureOrderStatusTimestamps } from "@/lib/order-status";

async function ensureReturnRequestsTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS return_requests (
            id BIGSERIAL PRIMARY KEY,
            order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT 'PENDING',
            requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (order_id, product_id)
        )
    `;
}

export async function POST(
    request: Request,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        await ensureOrderStatusTimestamps();
        await ensureReturnRequestsTable();
        const token = (await cookies()).get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        const { orderId } = await context.params;
        const parsedOrderId = Number(orderId);
        const body = await request.json();
        const productId = Number(body.productId);

        if (!user?.id || !Number.isInteger(parsedOrderId) || !Number.isInteger(productId)) {
            return Response.json({ success: false, message: "Invalid return request" }, { status: 400 });
        }

        const orders = await sql`
            SELECT id, order_status, delivered_at
            FROM orders
            WHERE id = ${parsedOrderId} AND user_id = ${Number(user.id)}
            LIMIT 1
        `;

        if (orders.length === 0) {
            return Response.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const order = orders[0];
        const deliveredAt = order.delivered_at ? new Date(order.delivered_at).getTime() : 0;
        if (order.order_status !== "DELIVERED" || !deliveredAt || Date.now() >= deliveredAt + 5 * 24 * 60 * 60 * 1000) {
            return Response.json({ success: false, message: "The 5-day return window has expired" }, { status: 409 });
        }

        const item = await sql`
            SELECT product_id
            FROM order_items
            WHERE order_id = ${parsedOrderId} AND product_id = ${productId}
            LIMIT 1
        `;
        if (item.length === 0) {
            return Response.json({ success: false, message: "Product not found in this order" }, { status: 404 });
        }

        const result = await sql`
            INSERT INTO return_requests (order_id, product_id, user_id)
            VALUES (${parsedOrderId}, ${productId}, ${Number(user.id)})
            ON CONFLICT (order_id, product_id) DO NOTHING
            RETURNING id, status, requested_at
        `;

        if (result.length === 0) {
            return Response.json({ success: false, message: "Return already requested for this product" }, { status: 409 });
        }

        return Response.json({ success: true, returnRequest: result[0] });
    } catch (error) {
        console.error("Return request error:", error);
        return Response.json({ success: false, message: "Failed to submit return request" }, { status: 500 });
    }
}