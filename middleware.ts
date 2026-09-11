import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const adminToken = request.cookies.get(
        "admin_token"
    )?.value;

    let validAdminToken = false;

    if (adminToken) {
        try {
            const { payload } = await jwtVerify(adminToken, secret);
            validAdminToken = payload.type === "admin" && typeof payload.id === "number";
        } catch {
            validAdminToken = false;
        }
    }

    if (
        !validAdminToken &&
        request.nextUrl.pathname !== "/admin/login" &&
        request.nextUrl.pathname !== "/admin/setup"
    ) {
        return NextResponse.redirect(
            new URL("/admin/login", request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};