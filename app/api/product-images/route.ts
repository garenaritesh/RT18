import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.productId || !body.imageUrl) {
            return Response.json(
                {
                    success: false,
                    message: "Product ID and image URL are required",
                },
                { status: 400 }
            );
        }

        const result = await sql`
      INSERT INTO product_images (
        product_id,
        image_url
      )
      VALUES (
        ${body.productId},
        ${body.imageUrl}
      )
      RETURNING *
    `;

        return Response.json({
            success: true,
            image: result[0],
        });
    } catch (error) {
        console.error("Product image save error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to save product image",
            },
            { status: 500 }
        );
    }
}