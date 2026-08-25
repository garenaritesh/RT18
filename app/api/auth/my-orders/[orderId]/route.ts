import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
    request: Request,
    context: {
        params: Promise<{ orderId: string }>;
    }
) {
    try {
        // Get login cookie
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

        // Verify user
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

        const { orderId } = await context.params;

        const order = await sql`
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
      WHERE o.id = ${Number(orderId)}
        AND o.user_id = ${Number(user.id)}
      GROUP BY o.id
      LIMIT 1
    `;

        if (order.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Order not found",
                },
                { status: 404 }
            );
        }

        return Response.json({
            success: true,
            order: order[0],
        });
    } catch (error) {
        console.error("Order details error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to load order",
            },
            { status: 500 }
        );
    }
}