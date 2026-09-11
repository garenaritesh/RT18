import crypto from "crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

type PaymentOrderItem = { id: unknown; quantity: unknown; price: unknown };

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

        if (
            typeof razorpay_signature !== "string" ||
            !/^[a-f0-9]{64}$/i.test(razorpay_signature) ||
            !crypto.timingSafeEqual(
                Buffer.from(generatedSignature, "utf8"),
                Buffer.from(razorpay_signature, "utf8")
            )
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Payment verification failed",
                },
                { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
            return Response.json(
                { success: false, message: "Invalid order items" },
                { status: 400 }
            );
        }

        let serverSubtotal = 0;
        const typedItems = items as PaymentOrderItem[];
        const productIds = typedItems.map((item) => Number(item.id));

        if (
            new Set(productIds).size !== productIds.length ||
            productIds.some((id: number) => !Number.isSafeInteger(id) || id <= 0)
        ) {
            return Response.json(
                { success: false, message: "Invalid order items" },
                { status: 400 }
            );
        }

        for (const item of typedItems) {
            const quantity = Number(item.quantity);
            const productResult = await sql`
                SELECT price, discount_price, stock
                FROM products
                WHERE id = ${Number(item.id)}
                LIMIT 1
            `;

            if (
                productResult.length === 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                quantity > Number(productResult[0].stock)
            ) {
                return Response.json(
                    { success: false, message: "Invalid or unavailable order item" },
                    { status: 400 }
                );
            }

            const sellingPrice =
                Number(productResult[0].price) - Number(productResult[0].discount_price || 0);

            if (Number(item.price) !== sellingPrice) {
                return Response.json(
                    { success: false, message: "Invalid product price" },
                    { status: 400 }
                );
            }

            serverSubtotal += sellingPrice * quantity;
        }

        const serverTotalAmount = Math.max(
            0,
            serverSubtotal + (serverSubtotal > 500 ? 0 : 70) - 20
        );

        if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) !== serverTotalAmount) {
            return Response.json(
                { success: false, message: "Order amount mismatch" },
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

                // Clear only this user's cart after payment and order creation succeed.
                await sql`
                        DELETE FROM cart
                        WHERE user_id = ${userId}
                `;

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