import { getAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

async function ensureSupportTable() {
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
}

export async function GET() {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await ensureSupportTable();

        const requests = await sql`
            SELECT
                r.id,
                r.user_id,
                r.requester_name,
                r.email,
                r.phone,
                r.status,
                r.admin_note,
                r.created_at,
                r.resolved_at,
                u.name AS user_name,
                u.email AS user_email,
                u.phone AS user_phone
            FROM password_reset_requests r
            LEFT JOIN users u ON u.id = r.user_id
            ORDER BY
                CASE WHEN r.status = 'PENDING' THEN 0 ELSE 1 END,
                r.created_at DESC
        `;

        return Response.json({ success: true, requests });
    } catch (error) {
        console.error("Get support requests error:", error);
        return Response.json(
            { success: false, message: "Failed to load support requests" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const requestId = Number(body.id);
        const action = body.action === "RESET_PASSWORD" ? "RESET_PASSWORD" : "UPDATE_STATUS";
        const status = body.status === "CLOSED" ? "CLOSED" : "RESOLVED";
        const note = typeof body.note === "string" ? body.note.trim() : "";

        if (!Number.isInteger(requestId) || requestId < 1) {
            return Response.json({ success: false, message: "Invalid request ID" }, { status: 400 });
        }

        await ensureSupportTable();

        if (action === "RESET_PASSWORD") {
            const requests = await sql`
                SELECT user_id
                FROM password_reset_requests
                WHERE id = ${requestId}
                LIMIT 1
            `;

            if (requests.length === 0 || !requests[0].user_id) {
                return Response.json(
                    { success: false, message: "This request is not linked to a registered user" },
                    { status: 400 }
                );
            }

            const temporaryPassword = `RT18-${randomBytes(6).toString("base64url")}`;
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            await sql`
                UPDATE users
                SET password = ${hashedPassword}
                WHERE id = ${requests[0].user_id}
            `;

            return Response.json({
                success: true,
                temporaryPassword,
                message: "Temporary password generated. Share it with the customer manually.",
            });
        }

        const result = await sql`
            UPDATE password_reset_requests
            SET
                status = ${status},
                admin_note = ${note || null},
                resolved_at = NOW(),
                resolved_by = ${admin.id}
            WHERE id = ${requestId}
            RETURNING id, status, admin_note, resolved_at
        `;

        if (result.length === 0) {
            return Response.json({ success: false, message: "Support request not found" }, { status: 404 });
        }

        return Response.json({ success: true, request: result[0] });
    } catch (error) {
        console.error("Update support request error:", error);
        return Response.json(
            { success: false, message: "Failed to update support request" },
            { status: 500 }
        );
    }
}
