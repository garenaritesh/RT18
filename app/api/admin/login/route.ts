import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.email || !body.password) {
            return Response.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 }
            );
        }

        const result = await sql`
    SELECT
        id,
        name,
        email,
        password,
        role,
        is_active
    FROM admins
    WHERE email = ${body.email}
    LIMIT 1
`;
        if (result.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        const admin = result[0];

        if (!admin.is_active) {
            return Response.json(
                {
                    success: false,
                    message: "Your admin account has been deactivated",
                },
                { status: 403 }
            );
        }

        const passwordMatch = await bcrypt.compare(
            body.password,
            admin.password
        );

        if (!passwordMatch) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        const cookieStore = await cookies();
        const token = await createAdminToken({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        });

        cookieStore.set(
            "admin_token",
            token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            }
        );

        return Response.json({
            success: true,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return Response.json(
            {
                success: false,
                message: "Login failed",
            },
            { status: 500 }
        );
    }
}