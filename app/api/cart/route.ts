import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

async function getUserId() {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return null;

    const user = await verifyToken(token);
    return user?.id ? Number(user.id) : null;
}

export async function GET() {
    try {
        const userId = await getUserId();

        if (!userId) {
            return Response.json({ success: false, cart: [] }, { status: 401 });
        }

        const cart = await sql`
            SELECT
                c.id AS cart_id,
                c.user_id,
                c.product_id AS id,
                p.name,
                (p.price - COALESCE(p.discount_price, 0)) AS price,
                p.image_url,
                c.quantity
            FROM cart c
            INNER JOIN products p ON p.id = c.product_id
            WHERE c.user_id = ${userId}
            ORDER BY c.id DESC
        `;

        return Response.json({ success: true, cart });
    } catch (error) {
        console.error("Cart loading error:", error);
        return Response.json(
            { success: false, message: "Failed to load cart" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return Response.json({ success: false, message: "Please login" }, { status: 401 });
        }

        const { productId, quantity = 1 } = await request.json();
        const safeProductId = Number(productId);
        const safeQuantity = Number(quantity);

        if (!Number.isInteger(safeProductId) || !Number.isInteger(safeQuantity) || safeQuantity < 1) {
            return Response.json({ success: false, message: "Invalid cart data" }, { status: 400 });
        }

        const product = await sql`
            SELECT id, stock
            FROM products
            WHERE id = ${safeProductId}
            LIMIT 1
        `;

        if (!product[0]) {
            return Response.json({ success: false, message: "Product not found" }, { status: 404 });
        }

        const existing = await sql`
            SELECT quantity
            FROM cart
            WHERE user_id = ${userId} AND product_id = ${safeProductId}
            LIMIT 1
        `;

        const newQuantity = Number(existing[0]?.quantity || 0) + safeQuantity;
        if (newQuantity > Number(product[0].stock)) {
            return Response.json({ success: false, message: "Maximum available stock reached" }, { status: 400 });
        }

        if (existing[0]) {
            await sql`
                UPDATE cart
                SET quantity = ${newQuantity}
                WHERE user_id = ${userId} AND product_id = ${safeProductId}
            `;
        } else {
            await sql`
                INSERT INTO cart (user_id, product_id, quantity)
                VALUES (${userId}, ${safeProductId}, ${safeQuantity})
            `;
        }

        return Response.json({ success: true, quantity: newQuantity });
    } catch (error) {
        console.error("Add to cart error:", error);
        return Response.json({ success: false, message: "Failed to add product to cart" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return Response.json({ success: false }, { status: 401 });
        }

        const { productId, quantity } = await request.json();
        const safeQuantity = Number(quantity);

        if (!Number.isInteger(Number(productId)) || !Number.isInteger(safeQuantity)) {
            return Response.json({ success: false, message: "Invalid cart data" }, { status: 400 });
        }

        if (safeQuantity <= 0) {
            await sql`
                DELETE FROM cart
                WHERE user_id = ${userId} AND product_id = ${Number(productId)}
            `;
        } else {
            await sql`
                UPDATE cart
                SET quantity = ${safeQuantity}
                WHERE user_id = ${userId} AND product_id = ${Number(productId)}
            `;
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Cart update error:", error);
        return Response.json({ success: false }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return Response.json({ success: false }, { status: 401 });
        }

        const { productId } = await request.json();

        if (productId === undefined) {
            await sql`DELETE FROM cart WHERE user_id = ${userId}`;
        } else {
            await sql`
                DELETE FROM cart
                WHERE user_id = ${userId} AND product_id = ${Number(productId)}
            `;
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("Cart removal error:", error);
        return Response.json({ success: false }, { status: 500 });
    }
}
