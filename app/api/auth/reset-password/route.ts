import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = typeof body.token === "string" ? body.token.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!token || !password) {
            return Response.json(
                { success: false, message: "Reset token and new password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                { success: false, message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        await sql`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id BIGSERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMPTZ NOT NULL,
                used_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;

        const tokenHash = hashToken(token);
        const tokens = await sql`
            SELECT id, user_id
            FROM password_reset_tokens
            WHERE token_hash = ${tokenHash}
                AND used_at IS NULL
                AND expires_at > NOW()
            LIMIT 1
        `;

        if (tokens.length === 0) {
            return Response.json(
                { success: false, message: "This reset link is invalid or expired" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await sql`
            UPDATE users
            SET password = ${hashedPassword}
            WHERE id = ${tokens[0].user_id}
        `;

        await sql`
            UPDATE password_reset_tokens
            SET used_at = NOW()
            WHERE id = ${tokens[0].id}
        `;

        return Response.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return Response.json(
            { success: false, message: "Unable to reset password" },
            { status: 500 }
        );
    }
}
