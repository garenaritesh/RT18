import { sql } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await sql`
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.id = ${Number(id)}
      LIMIT 1
    `;

        if (result.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Product not found",
                },
                { status: 404 }
            );
        }

        const images = await sql`
      SELECT
        id,
        image_url
      FROM product_images
      WHERE product_id = ${Number(id)}
      ORDER BY created_at ASC
    `;

        return Response.json({
            success: true,
            product: result[0],
            images,
        });
    } catch (error) {
        console.error("Get product error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to load product",
            },
            { status: 500 }
        );
    }
}