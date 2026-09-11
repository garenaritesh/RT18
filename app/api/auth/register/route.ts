import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken } from "@/lib/auth";

function normalizeIdentifier(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function normalizeEmail(value: unknown) {
    return normalizeIdentifier(value).toLowerCase();
}

function normalizePhone(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.replace(/\D/g, "");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = normalizeEmail(body.email ?? body.identifier);
        const phone = normalizePhone(body.phone);
        const password = typeof body.password === "string" ? body.password : "";
        const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

        if (!name || !email || !password) {
            return Response.json(
                {
                    success: false,
                    message: "Name, email, and password are required",
                },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                {
                    success: false,
                    message: "Please enter a valid email address",
                },
                { status: 400 }
            );
        }

        if (phone && phone.length !== 10) {
            return Response.json(
                {
                    success: false,
                    message: "Please enter a valid 10-digit phone number",
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

        if (confirmPassword && password !== confirmPassword) {
            return Response.json(
                {
                    success: false,
                    message: "Passwords do not match",
                },
                { status: 400 }
            );
        }

        const existingByEmail = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;

        if (existingByEmail.length > 0) {
            return Response.json(
                {
                    success: false,
                    message: "This email is already registered",
                },
                { status: 409 }
            );
        }

        if (phone) {
            const existingByPhone = await sql`
                SELECT id FROM users WHERE phone = ${phone} LIMIT 1
            `;

            if (existingByPhone.length > 0) {
                return Response.json(
                    {
                        success: false,
                        message: "This phone number is already registered",
                    },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await sql`
      INSERT INTO users (
        name,
        email,
        phone,
        password
      )
      VALUES (
        ${name},
                ${email},
                ${phone || null},
        ${hashedPassword}
      )
      RETURNING id, name, email, phone, created_at
    `;

        const user = result[0];

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