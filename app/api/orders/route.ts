import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
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
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  return Response.json(orders);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    let userId: number | null = null;

    if (token) {
      const user = await verifyToken(token);

      if (user?.id) {
        userId = Number(user.id);
      }
    }

    const body = await request.json();

    const result = await sql`
      INSERT INTO orders (
        user_id,
        customer_name,
        phone,
        address,
        city,
        pincode,
        payment_method,
        total_amount
      )
      VALUES (
        ${userId},
        ${body.name},
        ${body.phone},
        ${body.address},
        ${body.city},
        ${body.pincode},
        ${body.paymentMethod},
        ${body.totalAmount}
      )
      RETURNING *
    `;

    const order = result[0];

    for (const item of body.items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (
          ${order.id},
          ${item.id},
          ${item.quantity},
          ${item.price}
        )
      `;

      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.id}
          AND stock >= ${item.quantity}
      `;
    }

    // Clear only this user's cart after the order is created.
    if (userId) {
      await sql`
        DELETE FROM cart
        WHERE user_id = ${userId}
      `;
    }

    return Response.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create order",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    let result;

    if (body.status === "CANCELLED") {
      result = await sql`
        UPDATE orders
        SET
          order_status = ${body.status},
          cancellation_reason = ${body.cancellationReason || null}
        WHERE id = ${body.id}
        RETURNING *
      `;
    } else {
      result = await sql`
        UPDATE orders
        SET
          order_status = ${body.status}
        WHERE id = ${body.id}
        RETURNING *
      `;
    }

    if (result.length === 0) {
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
      order: result[0],
    });
  } catch (error) {
    console.error("Update order error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}