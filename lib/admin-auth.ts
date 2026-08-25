import { cookies } from "next/headers";
import { sql } from "@/lib/db";

export async function getAdmin() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("admin_token")?.value;

        if (!token) {
            return null;
        }

        const adminId = Number(token);

        if (!adminId) {
            return null;
        }

        const result = await sql`
            SELECT
                id,
                name,
                email,
                role,
                is_active
            FROM admins
            WHERE id = ${adminId}
            LIMIT 1
        `;

        if (result.length === 0) {
            return null;
        }

        return result[0];

    } catch (error) {
        console.error("Admin auth error:", error);
        return null;
    }
}

export async function getMainAdmin() {
    const admin = await getAdmin();

    if (!admin) {
        return null;
    }

    if (admin.role !== "MAIN_ADMIN") {
        return null;
    }

    return admin;
}