import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return Response.json(
                {
                    success: false,
                    user: null,
                },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user?.id) {
            return Response.json(
                {
                    success: false,
                    user: null,
                },
                { status: 401 }
            );
        }

        // Get latest user details from database
        const result = await sql`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        city,
        pincode
      FROM users
      WHERE id = ${Number(user.id)}
      LIMIT 1
    `;

        if (result.length === 0) {
            return Response.json(
                {
                    success: false,
                    user: null,
                },
                { status: 404 }
            );
        }

        return Response.json({
            success: true,
            user: result[0],
        });
    } catch (error) {
        console.error("Auth check error:", error);

        return Response.json(
            {
                success: false,
                user: null,
            },
            { status: 401 }
        );
    }
}