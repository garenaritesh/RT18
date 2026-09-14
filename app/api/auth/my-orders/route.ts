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

export async function GET() {
    try {
      await ensureOrderStatusTimestamps();
      await ensureReturnRequestsTable();
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return Response.json(
                {
                    success: false,
                    message: "Please login first",
                },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user?.id) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid or expired session",
                },
                { status: 401 }
            );
        }

        const orders = await sql`
      SELECT
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product_name', p.name,
              'image_url', p.image_url,
              'return_status', (
                SELECT rr.status
                FROM return_requests rr
                WHERE rr.order_id = o.id
                  AND rr.product_id = oi.product_id
                  AND rr.user_id = o.user_id
                LIMIT 1
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi
        ON o.id = oi.order_id
      LEFT JOIN products p
        ON oi.product_id = p.id
      WHERE o.user_id = ${Number(user.id)}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

        return Response.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("My orders error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to load orders",
            },
            { status: 500 }
        );
    }
}