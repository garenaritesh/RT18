import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 }
            );
        }

        const users = await sql`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

        if (users.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
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

        const token = await createToken({
            id: user.id,
            name: user.name,
            email: user.email,
        });

        const response = Response.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

        response.headers.append(
            "Set-Cookie",
            `auth_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
        );

        return response;
    } catch (error) {
        console.error("Login error:", error);

        return Response.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}