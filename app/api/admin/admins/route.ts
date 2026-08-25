import { sql } from "@/lib/db";
import { getMainAdmin } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        // Only MAIN_ADMIN can create another admin
        const mainAdmin = await getMainAdmin();

        if (!mainAdmin) {
            return Response.json(
                {
                    success: false,
                    message: "Only Main Admin can create new admins",
                },
                { status: 403 }
            );
        }

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

        const existingAdmin = await sql`
            SELECT id
            FROM admins
            WHERE email = ${body.email}
            LIMIT 1
        `;

        if (existingAdmin.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "An admin with this email already exists",
                },
                { status: 409 }
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
                'ADMIN'
            )
            RETURNING id, name, email, role, is_active, created_at
        `;

        return Response.json({
            success: true,
            admin: result[0],
        });

    } catch (error) {
        console.error("Create admin error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to create admin",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const mainAdmin = await getMainAdmin();

        if (!mainAdmin) {
            return Response.json(
                {
                    success: false,
                    message: "Only Main Admin can view admins",
                },
                { status: 403 }
            );
        }

        const admins = await sql`
            SELECT
                id,
                name,
                email,
                role,
                is_active,
                created_at
            FROM admins
            ORDER BY
                CASE
                    WHEN role = 'MAIN_ADMIN' THEN 0
                    ELSE 1
                END,
                created_at DESC
        `;

        return Response.json({
            success: true,
            admins,
        });

    } catch (error) {
        console.error("Get admins error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to load admins",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const mainAdmin = await getMainAdmin();

        if (!mainAdmin) {
            return Response.json(
                {
                    success: false,
                    message: "Only Main Admin can change admin status",
                },
                { status: 403 }
            );
        }

        const body = await request.json();

        if (!body.id || typeof body.isActive !== "boolean") {
            return Response.json(
                {
                    success: false,
                    message: "Admin ID and status are required",
                },
                { status: 400 }
            );
        }

        // Main Admin cannot be deactivated
        if (Number(body.id) === Number(mainAdmin.id)) {
            return Response.json(
                {
                    success: false,
                    message: "Main Admin cannot be deactivated",
                },
                { status: 403 }
            );
        }

        const result = await sql`
            UPDATE admins
            SET is_active = ${body.isActive}
            WHERE id = ${body.id}
              AND role = 'ADMIN'
            RETURNING
                id,
                name,
                email,
                role,
                is_active,
                created_at
        `;

        if (result.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Admin not found",
                },
                { status: 404 }
            );
        }

        return Response.json({
            success: true,
            admin: result[0],
        });

    } catch (error) {
        console.error("Update admin status error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to update admin status",
            },
            { status: 500 }
        );
    }
}