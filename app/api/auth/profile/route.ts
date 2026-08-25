import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: Request) {
    try {
        // Get logged-in user
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return Response.json(
                {
                    success: false,
                    message: "Please login first",
                },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user?.id) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid or expired session",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const name = body.name?.trim();
        const phone = body.phone?.trim();
        const address = body.address?.trim();
        const city = body.city?.trim();
        const pincode = body.pincode?.trim();

        if (!name) {
            return Response.json(
                {
                    success: false,
                    message: "Name is required",
                },
                { status: 400 }
            );
        }

        const result = await sql`
      UPDATE users
      SET
        name = ${name},
        phone = ${phone || null},
        address = ${address || null},
        city = ${city || null},
        pincode = ${pincode || null}
      WHERE id = ${Number(user.id)}
      RETURNING id, name, email, phone, address, city, pincode
    `;

        if (result.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return Response.json({
            success: true,
            message: "Profile updated successfully",
            user: result[0],
        });
    } catch (error) {
        console.error("Profile update error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to update profile",
            },
            { status: 500 }
        );
    }
}