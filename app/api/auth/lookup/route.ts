import { sql } from "@/lib/db";

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

        if (!email) {
            return Response.json(
                {
                    success: false,
                    message: "Email is required",
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

        const result = await sql`
      SELECT id
      FROM users
    WHERE email = ${email}
      LIMIT 1
    `;

        return Response.json({
            success: true,
            exists: result.length > 0,
        });
    } catch (error) {
        console.error("Account lookup error:", error);

        return Response.json(
            {
                success: false,
                message: "Unable to check account",
            },
            { status: 500 }
        );
    }
}
