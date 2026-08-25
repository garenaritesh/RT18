import { sql } from "@/lib/db";

export async function GET() {
  const products = await sql`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;

  return Response.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = await sql`
    INSERT INTO products (
      name,
      price,
      discount_price,
      stock,
      image_url,
      category_id
    )
    VALUES (
      ${body.name},
      ${body.price},
      ${body.discountPrice || null},
      ${body.stock},
      ${body.imageUrl},
      ${body.categoryId}
    )
    RETURNING *
  `;

  return Response.json({
    success: true,
    product: result[0],
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  let result;

  if (body.imageUrl) {
    result = await sql`
      UPDATE products
      SET
        name = ${body.name},
        price = ${body.price},
        discount_price = ${body.discountPrice || null},
        stock = ${body.stock},
        category_id = ${body.categoryId},
        image_url = ${body.imageUrl}
      WHERE id = ${body.id}
      RETURNING *
    `;
  } else {
    result = await sql`
      UPDATE products
      SET
        name = ${body.name},
        price = ${body.price},
        discount_price = ${body.discountPrice || null},
        stock = ${body.stock},
        category_id = ${body.categoryId}
      WHERE id = ${body.id}
      RETURNING *
    `;
  }

  return Response.json({
    success: true,
    product: result[0],
  });
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const existingOrder = await sql`
      SELECT id
      FROM order_items
      WHERE product_id = ${body.id}
      LIMIT 1
    `;

    if (existingOrder.length > 0) {
      return Response.json(
        {
          success: false,
          message:
            "This product cannot be deleted because it is already part of an order.",
        },
        { status: 409 }
      );
    }

    await sql`
      DELETE FROM products
      WHERE id = ${body.id}
    `;

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}