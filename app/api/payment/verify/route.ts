import crypto from "crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            name,
            phone,
            address,
            city,
            pincode,
            totalAmount,
            items,
        } = body;

        // =========================
        // GET LOGGED-IN USER
        // =========================

        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return Response.json(
                {
                    success: false,
                    message: "Please login before placing the order",
                },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user?.id) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid or expired login session",
                },
                { status: 401 }
            );
        }

        const userId = Number(user.id);

        // =========================
        // VERIFY RAZORPAY SIGNATURE
        // =========================

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return Response.json(
                {
                    success: false,
                    message: "Payment verification failed",
                },
                { status: 400 }
            );
        }

        // =========================
        // CREATE ORDER
        // =========================

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
        order_status,
        total_amount
      )
      VALUES (
        ${userId},
        ${name},
        ${phone},
        ${address},
        ${city},
        ${pincode},
        'RAZORPAY',
        'PAID',
        'PLACED',
        ${totalAmount}
      )
      RETURNING *
    `;

        const order = result[0];

        // =========================
        // ORDER ITEMS + STOCK
        // =========================

        for (const item of items) {
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

        return Response.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        return Response.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}