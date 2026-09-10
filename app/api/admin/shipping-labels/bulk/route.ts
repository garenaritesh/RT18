import { promises as fs } from "fs";
import path from "path";
import { getAdmin } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { addShippingLabel, ShippingLabelOrder } from "@/lib/shipping-label";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const MAX_ORDER_IDS = 500;
type BulkLabelOrder = ShippingLabelOrder;

async function getBrandLogoDataUrl() {
    const logoPath = path.join(process.cwd(), "app", "assests", "brand_new.png");
    const logo = await fs.readFile(logoPath);
    return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function POST(request: Request) {
    try {
        const admin = await getAdmin();
        if (!admin) return Response.json({ success: false, message: "Forbidden" }, { status: 403 });

        const body = await request.json();
        if (!Array.isArray(body?.orderIds) || body.orderIds.length === 0) {
            return Response.json({ success: false, message: "orderIds must be a non-empty array" }, { status: 400 });
        }
        if (body.orderIds.length > MAX_ORDER_IDS) {
            return Response.json({ success: false, message: `A maximum of ${MAX_ORDER_IDS} orders can be generated at once` }, { status: 413 });
        }

        const orderIds = body.orderIds as number[];
        if (orderIds.some((id) => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) || new Set(orderIds).size !== orderIds.length) {
            return Response.json({ success: false, message: "orderIds must contain unique positive numeric IDs" }, { status: 400 });
        }

        const orders = (await sql`
            SELECT
                o.id, o.customer_name, o.phone, o.address, o.city, o.pincode,
                o.payment_method, o.payment_status, o.total_amount, o.order_status, o.created_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price
                        )
                    ) FILTER (WHERE oi.id IS NOT NULL),
                    '[]'
                ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = ANY(${orderIds}::int[])
            GROUP BY o.id
            ORDER BY array_position(${orderIds}::int[], o.id)
        `) as unknown as BulkLabelOrder[];

        if (orders.length !== orderIds.length) {
            return Response.json({ success: false, message: "One or more orders were not found" }, { status: 404 });
        }
        if (orders.some((order) => order.order_status !== "CONFIRMED")) {
            return Response.json({ success: false, message: "Bulk labels can only be generated for confirmed orders" }, { status: 409 });
        }

        const logoDataUrl = await getBrandLogoDataUrl();
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        for (const [index, order] of orders.entries()) {
            if (index > 0) pdf.addPage();
            const qrDataUrl = await QRCode.toDataURL(`RT18-ORDER-${order.id}`, { margin: 0, width: 256 });
            addShippingLabel(pdf, order, { logoDataUrl, qrDataUrl });
        }

        return new Response(pdf.output("arraybuffer"), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=RT18-Shipping-Labels.pdf",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Bulk shipping label error:", error);
        return Response.json({ success: false, message: "Failed to generate shipping labels" }, { status: 500 });
    }
}
