import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER(${name})
      LIMIT 1
    `;

    if (existing.length > 0) {
      return Response.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    const result = await sql`
      INSERT INTO categories (name)
      VALUES (${name})
      RETURNING *
    `;

    return Response.json({
      success: true,
      category: result[0],
    });
  } catch (error) {
    console.error("Add category error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to add category",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await sql`
      SELECT *
      FROM categories
      ORDER BY created_at DESC
    `;

    return Response.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load categories",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    // Check whether products are using this category
    const products = await sql`
      SELECT id
      FROM products
      WHERE category_id = ${body.id}
      LIMIT 1
    `;

    if (products.length > 0) {
      return Response.json(
        {
          success: false,
          message:
            "This category cannot be deleted because products are using it.",
        },
        { status: 409 }
      );
    }

    const result = await sql`
      DELETE FROM categories
      WHERE id = ${body.id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}