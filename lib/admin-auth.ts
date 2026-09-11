import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createAdminToken(admin: {
    id: number;
    name: string;
    email: string;
    role: string;
}) {
    return await new SignJWT({
        type: "admin",
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);

        if (payload.type !== "admin" || typeof payload.id !== "number") {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export async function getAdmin() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("admin_token")?.value;

        if (!token) {
            return null;
        }

        const payload = await verifyAdminToken(token);

        if (!payload) {
            return null;
        }

        const result = await sql`
            SELECT
                id,
                name,
                email,
                role,
                is_active
            FROM admins
                        WHERE id = ${payload.id}
                            AND is_active = true
            LIMIT 1
        `;

        if (result.length === 0) {
            return null;
        }

        return result[0];

    } catch (error) {
        console.error("Admin auth error:", error);
        return null;
    }
}

export async function getMainAdmin() {
    const admin = await getAdmin();

    if (!admin) {
        return null;
    }

    if (admin.role !== "MAIN_ADMIN") {
        return null;
    }

    return admin;
}