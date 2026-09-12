import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";

        if (!email && !phone) {
            return Response.json(
                { success: false, message: "Email or phone number is required" },
                { status: 400 }
            );
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return Response.json(
                { success: false, message: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        if (phone && !/^\d{10}$/.test(phone)) {
            return Response.json(
                { success: false, message: "Please enter a valid 10-digit phone number" },
                { status: 400 }
            );
        }

        await sql`
            CREATE TABLE IF NOT EXISTS password_reset_requests (
                id BIGSERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                requester_name TEXT,
                email TEXT,
                phone TEXT,
                status TEXT NOT NULL DEFAULT 'PENDING',
                admin_note TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                resolved_at TIMESTAMPTZ,
                resolved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL
            )
        `;

        const users = email && phone
            ? await sql`
                SELECT id
                FROM users
                WHERE LOWER(email) = ${email} OR phone = ${phone}
                LIMIT 1
            `
            : email
                ? await sql`
                    SELECT id
                    FROM users
                    WHERE LOWER(email) = ${email}
                    LIMIT 1
                `
                : await sql`
                    SELECT id
                    FROM users
                    WHERE phone = ${phone}
                    LIMIT 1
                `;

        await sql`
            INSERT INTO password_reset_requests (
                user_id,
                requester_name,
                email,
                phone
            )
            VALUES (
                ${users[0]?.id || null},
                ${name || null},
                ${email || null},
                ${phone || null}
            )
        `;

        return Response.json({
            success: true,
            message: "Your request has been sent to support. Our team will contact you after resetting the password.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return Response.json(
            {
                success: false,
                message: "Unable to send password reset request",
            },
            { status: 500 }
        );
    }
}
