import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name || !body.email || !body.password) {
            return Response.json(
                {
                    success: false,
                    message: "Name, email and password are required",
                },
                { status: 400 }
            );
        }

        // Only allow setup if no admin exists
        const existingAdmins = await sql`
            SELECT id
            FROM admins
            LIMIT 1
        `;

        if (existingAdmins.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "Admin setup has already been completed",
                },
                { status: 403 }
            );
        }

        const hashedPassword = await bcrypt.hash(
            body.password,
            10
        );

        const result = await sql`
            INSERT INTO admins (
                name,
                email,
                password,
                role
            )
            VALUES (
                ${body.name},
                ${body.email},
                ${hashedPassword},
                'MAIN_ADMIN'
            )
            RETURNING id, name, email, role
        `;

        return Response.json({
            success: true,
            admin: result[0],
        });

    } catch (error) {
        console.error("Admin setup error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to create main admin",
            },
            { status: 500 }
        );
    }
}