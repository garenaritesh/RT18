import { sql } from "@/lib/db";

export async function GET() {
    const result = await sql`SELECT NOW()`;

    return Response.json({
        success: true,
        databaseTime: result[0],
    });
}