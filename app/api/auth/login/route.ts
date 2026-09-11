import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken } from "@/lib/auth";

function normalizeIdentifier(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().toLowerCase();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const email = normalizeIdentifier(body.email ?? body.identifier);
        const password = typeof body.password === "string" ? body.password : "";

        if (!email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "Email and password are required",
                },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json(
                {
                    success: false,
                    message: "Please enter a valid email address",
                },
                { status: 400 }
            );
        }

                const userResult = await sql`
                        SELECT id, name, email, phone, password
                        FROM users
                        WHERE email = ${email}
                        LIMIT 1
                `;

        if (userResult.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid email or password",
                },
                { status: 401 }
            );
        }

        const user = userResult[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

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