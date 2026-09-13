import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function ensureReviewsTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            reviewer_name VARCHAR(120) NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL,
            photos TEXT[] NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;
}

export async function GET(request: Request) {
    try {
        const productId = Number(new URL(request.url).searchParams.get("productId"));
        if (!Number.isInteger(productId) || productId <= 0) {
            return Response.json({ success: false, message: "Invalid product" }, { status: 400 });
        }

        await ensureReviewsTable();
        const reviews = await sql`
            SELECT id, reviewer_name, rating, comment, photos, created_at
            FROM reviews
            WHERE product_id = ${productId}
            ORDER BY created_at DESC
        `;

        return Response.json({ success: true, reviews });
    } catch (error) {
        console.error("Reviews loading error:", error);
        return Response.json({ success: false, reviews: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user?.id) {
            return Response.json({ success: false, message: "Please login to write a review" }, { status: 401 });
        }

        const body = await request.json();
        const productId = Number(body.productId);
        const rating = Number(body.rating);
        const comment = String(body.comment || "").trim();
        const photos = Array.isArray(body.photos)
            ? body.photos.filter((photo: unknown): photo is string => typeof photo === "string").slice(0, 5)
            : [];

        if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
            return Response.json({ success: false, message: "Rating and review are required" }, { status: 400 });
        }

        await ensureReviewsTable();
        // A session can outlive a database reset. Keep the review usable even
        // when the token's old user id no longer exists in the users table.
        const existingUser = await sql`
            SELECT id FROM users WHERE id = ${Number(user.id)} LIMIT 1
        `;
        const userId = existingUser.length > 0 ? Number(existingUser[0].id) : null;
        const result = await sql`
            INSERT INTO reviews (product_id, user_id, reviewer_name, rating, comment, photos)
            VALUES (${productId}, ${userId}, ${String(user.name || "Customer")}, ${rating}, ${comment}, ${photos})
            RETURNING id, reviewer_name, rating, comment, photos, created_at
        `;

        return Response.json({ success: true, review: result[0] }, { status: 201 });
    } catch (error) {
        console.error("Review creation error:", error);
        return Response.json({ success: false, message: "Failed to submit review" }, { status: 500 });
    }
}
