import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();

        cookieStore.set("auth_token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
            sameSite: "lax",
        });

        return Response.json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return Response.json(
            {
                success: false,
                message: "Logout failed",
            },
            { status: 500 }
        );
    }
}