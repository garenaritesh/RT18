import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
    try {
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
              'image_url', p.image_url
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