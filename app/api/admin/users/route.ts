import { getAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return Response.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const users = await sql`
            SELECT
                id,
                name,
                email,
                phone,
                created_at
            FROM users
            ORDER BY created_at DESC
        `;

        return Response.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to load users",
            },
            { status: 500 }
        );
    }
}