import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdmin();

  if (!admin) {
    return Response.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
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

    if (
      body.paymentMethod !== "COD" &&
      body.paymentMethod !== "PREPAID" &&
      body.paymentMethod !== "RAZORPAY"
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    if (body.paymentMethod === "PREPAID") {

      if (typeof body.transactionId !== "string") {
        return Response.json(
          {
            success: false,
            message: "Invalid Transaction ID",
          },
          { status: 400 }
        );
      }

      const transactionId = body.transactionId?.trim();

      if (!transactionId) {
        return Response.json(
          {
            success: false,
            message: "Transaction ID is required for prepaid payment",
          },
          { status: 400 }
        );
      }

      if (transactionId.length < 6 || transactionId.length > 100) {
        return Response.json(
          {
            success: false,
            message: "Invalid Transaction ID",
          },
          { status: 400 }
        );
      }

      if (typeof body.paymentProof !== "string") {
        return Response.json(
          {
            success: false,
            message: "Invalid payment proof",
          },
          { status: 400 }
        );
      }

      if (!body.paymentProof.startsWith("https://res.cloudinary.com/")) {
        return Response.json(
          {
            success: false,
            message: "Invalid payment proof URL",
          },
          { status: 400 }
        );
      }


      if (!body.paymentProof.includes("/rt18-payment-proofs/")) {
        return Response.json(
          {
            success: false,
            message: "Invalid payment proof",
          },
          { status: 400 }
        );
      }


      if (!body.paymentProof) {
        return Response.json(
          {
            success: false,
            message: "Payment proof is required for prepaid payment",
          },
          { status: 400 }
        );
      }
    }

    if (
      typeof body.totalAmount !== "number" ||
      !Number.isFinite(body.totalAmount) ||
      body.totalAmount < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid total amount",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 50
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid order items",
        },
        { status: 400 }
      );
    }

    const productIds = body.items.map((item: any) => Number(item.id));

    if (new Set(productIds).size !== productIds.length) {
      return Response.json(
        {
          success: false,
          message: "Duplicate product in order",
        },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (
        !item.id ||
        !Number.isFinite(Number(item.id)) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) > 100 ||
        Number(item.price) < 0
      ) {
        return Response.json(
          {
            success: false,
            message: "Invalid order item",
          },
          { status: 400 }
        );
      }
    }

    for (const item of body.items) {
      const productResult = await sql`
 SELECT id, price, discount_price, stock
FROM products
    WHERE id = ${Number(item.id)}
    LIMIT 1
  `;

      if (productResult.length === 0) {
        return Response.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 400 }
        );
      }

      const product = productResult[0];

      const sellingPrice =
        Number(product.price) - Number(product.discount_price || 0);

      if (Number(item.price) !== sellingPrice) {


        return Response.json(
          {
            success: false,
            message: "Invalid product price",
          },
          { status: 400 }
        );
      }

      if (Number(item.quantity) > Number(product.stock)) {
        return Response.json(
          {
            success: false,
            message: "Insufficient stock",
          },
          { status: 400 }
        );
      }
    }

    let serverSubtotal = 0;

    for (const item of body.items) {
      const productResult = await sql`
    SELECT price,discount_price
    FROM products
    WHERE id = ${Number(item.id)}
    LIMIT 1
  `;

      if (productResult.length === 0) {
        return Response.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 400 }
        );
      }
      const sellingPrice =
        Number(productResult[0].price) -
        Number(productResult[0].discount_price || 0);

      serverSubtotal +=
        sellingPrice * Number(item.quantity);
    }

    const serverShippingCharge =
      serverSubtotal > 500 ? 0 : 70;

    const serverPaymentAdjustment =
      body.paymentMethod === "PREPAID" ? -20 : 0;

    const serverTotalAmount = Math.max(
      0,
      serverSubtotal + serverShippingCharge + serverPaymentAdjustment
    );

    if (Number(body.totalAmount) !== Number(serverTotalAmount)) {
      return Response.json(
        {
          success: false,
          message: "Order amount mismatch",
        },
        { status: 400 }
      );
    }

    if (
      !body.name?.trim() ||
      !body.phone?.trim() ||
      !body.address?.trim() ||
      !body.city?.trim() ||
      !body.pincode?.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "All customer details are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(body.phone.trim())) {
      return Response.json(
        {
          success: false,
          message: "Invalid phone number",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(body.pincode.trim())) {
      return Response.json(
        {
          success: false,
          message: "Invalid pincode",
        },
        { status: 400 }
      );
    }

    if (
      body.name.trim().length > 100 ||
      body.address.trim().length > 500 ||
      body.city.trim().length > 100
    ) {
      return Response.json(
        {
          success: false,
          message: "Customer details are too long",
        },
        { status: 400 }
      );
    }

    const result = await sql`
  INSERT INTO orders (
    user_id,
    customer_name,
    phone,
    address,
    city,
    pincode,
    payment_method,
    payment_status,
    transaction_id,
    payment_proof,
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
    ${body.paymentMethod === "PREPAID" ? "PENDING" : "PENDING"},
    ${body.transactionId || null},
    ${body.paymentProof || null},
    ${serverTotalAmount}
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

    const admin = await getAdmin();

    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    let result;

    if (!body.id || !Number.isFinite(Number(body.id))) {
      return Response.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (body.status && !allowedStatuses.includes(body.status)) {
      return Response.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 }
      );
    }

    if (!body.paymentStatus && !body.rejectPayment && !body.status) {
      return Response.json(
        {
          success: false,
          message: "No update specified",
        },
        { status: 400 }
      );
    }

    if (body.paymentStatus) {

      if (body.paymentStatus !== "PAID") {
        return Response.json(
          {
            success: false,
            message: "Invalid payment status",
          },
          { status: 400 }
        );
      }

      const result = await sql`
        UPDATE orders
        SET payment_status = ${body.paymentStatus}
        WHERE id = ${body.id}
  AND payment_status = 'PENDING'
        RETURNING *
    `;

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
    }

    // Reject Payment
    if (body.rejectPayment) {

      if (
        typeof body.reason !== "string" ||
        !body.reason.trim() ||
        body.reason.trim().length > 500
      ) {
        return Response.json(
          {
            success: false,
            message: "Invalid rejection reason",
          },
          { status: 400 }
        );
      }

      const result = await sql`
        UPDATE orders
        SET
            payment_status = 'REJECTED',
            payment_rejection_reason = ${body.reason},
            order_status = 'CANCELLED',
            cancellation_reason = ${body.reason}
        WHERE id = ${body.id}
  AND payment_status = 'PENDING'
        RETURNING *
    `;

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
    }

    if (body.status) {
      const currentOrder = await sql`
        SELECT order_status
        FROM orders
        WHERE id = ${body.id}
        LIMIT 1
      `;

      if (currentOrder.length === 0) {
        return Response.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      const currentStatus = String(currentOrder[0].order_status);
      const validTransitions: Record<string, string[]> = {
        PLACED: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["SHIPPED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!validTransitions[currentStatus]?.includes(body.status)) {
        return Response.json(
          {
            success: false,
            message: `Invalid order transition: ${currentStatus} to ${body.status}`,
          },
          { status: 409 }
        );
      }
    }

    if (body.status === "CANCELLED") {

      if (
        typeof body.cancellationReason !== "string" ||
        !body.cancellationReason.trim() ||
        body.cancellationReason.trim().length > 500
      ) {
        return Response.json(
          {
            success: false,
            message: "Invalid cancellation reason",
          },
          { status: 400 }
        );
      }

      result = await sql`
        UPDATE orders
        SET
          order_status = ${body.status},
          cancellation_reason = ${body.cancellationReason.trim()}
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