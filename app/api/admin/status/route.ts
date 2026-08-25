import { getAdmin } from "@/lib/admin-auth";

export async function GET() {
    const admin = await getAdmin();

    if (!admin) {
        return Response.json({
            deactivated: true,
        });
    }

    return Response.json({
        deactivated: admin.is_active === false,
    });
}