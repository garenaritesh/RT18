import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(
    _request: Request,
    context: { params: Promise<{ orderId: string }> }
) {
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

        const { orderId } = await context.params;
        const parsedOrderId = Number(orderId);

        if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid order ID",
                },
                { status: 400 }
            );
        }

        const orderResult = await sql`
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
              'line_total', oi.price * oi.quantity
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi
        ON o.id = oi.order_id
      LEFT JOIN products p
        ON oi.product_id = p.id
      WHERE o.id = ${parsedOrderId}
        AND o.user_id = ${Number(user.id)}
      GROUP BY o.id
      LIMIT 1
    `;

        if (orderResult.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Order not found",
                },
                { status: 404 }
            );
        }

        const order = orderResult[0];
        const items = Array.isArray(order.items) ? order.items : [];

        if (!items.length) {
            return Response.json(
                {
                    success: false,
                    message: "Order items unavailable",
                },
                { status: 404 }
            );
        }

        const pdf = generateInvoicePdf({
            id: Number(order.id),
            created_at: order.created_at,
            customer_name: order.customer_name,
            phone: order.phone,
            address: order.address,
            city: order.city,
            pincode: order.pincode,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            total_amount: order.total_amount,
            items: items.map((item: any) => ({
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                line_total: item.line_total,
            })),
        });

        const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="RT18-Order-${parsedOrderId}-Invoice.pdf"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Unable to generate invoice",
            },
            { status: 500 }
        );
    }
}
