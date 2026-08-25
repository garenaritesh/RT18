import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const name = body.name?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!name || !email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "All fields are required",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return Response.json(
                {
                    success: false,
                    message: "Password must be at least 6 characters",
                },
                { status: 400 }
            );
        }

        const existingUser = await sql`
      SELECT id
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

        if (existingUser.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "Email already registered",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await sql`
      INSERT INTO users (
        name,
        email,
        password
      )
      VALUES (
        ${name},
        ${email},
        ${hashedPassword}
      )
      RETURNING id, name, email, created_at
    `;

        const user = result[0];

        // Create login token
        const token = await createToken({
            id: user.id,
            name: user.name,
            email: user.email,
        });

        const response = Response.json({
            success: true,
            message: "Registration successful",
            user,
        });

        // Set login cookie
        response.headers.append(
            "Set-Cookie",
            `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
        );

        return response;
    } catch (error) {
        console.error("Register error:", error);

        return Response.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}