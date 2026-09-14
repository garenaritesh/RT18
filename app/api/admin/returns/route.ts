import { getAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

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

export async function GET() {
    try {
        const admin = await getAdmin();
        if (!admin) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await ensureReturnRequestsTable();

        const requests = await sql`
            SELECT
                rr.id,
                rr.order_id,
                rr.product_id,
                rr.status,
                rr.requested_at,
                o.customer_name,
                o.phone,
                u.email,
                p.name AS product_name,
                p.image_url
            FROM return_requests rr
            INNER JOIN orders o ON o.id = rr.order_id
            INNER JOIN users u ON u.id = rr.user_id
            INNER JOIN products p ON p.id = rr.product_id
            ORDER BY rr.requested_at DESC
        `;

        return Response.json({ success: true, requests });
    } catch (error) {
        console.error("Get return requests error:", error);
        return Response.json({ success: false, message: "Failed to load return requests" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const admin = await getAdmin();
        if (!admin) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await ensureReturnRequestsTable();
        const body = await request.json();
        const requestId = Number(body.id);
        const status = body.status === "ACCEPTED" || body.status === "DECLINED" ? body.status : "";

        if (!Number.isInteger(requestId) || !status) {
            return Response.json({ success: false, message: "Invalid return action" }, { status: 400 });
        }

        const result = await sql`
            UPDATE return_requests
            SET status = ${status}
            WHERE id = ${requestId} AND status = 'PENDING'
            RETURNING id, status
        `;

        if (result.length === 0) {
            return Response.json({ success: false, message: "Return request is missing or already processed" }, { status: 409 });
        }

        return Response.json({ success: true, request: result[0] });
    } catch (error) {
        console.error("Update return request error:", error);
        return Response.json({ success: false, message: "Failed to update return request" }, { status: 500 });
    }
}