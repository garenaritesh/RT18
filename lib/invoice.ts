import fs from "node:fs";
import path from "node:path";
import jsPDF from "jspdf";

export type InvoiceItem = {
    product_name?: string | null;
    product_id?: number | null;
    quantity?: number | string | null;
    price?: number | string | null;
    line_total?: number | string | null;
};

export type InvoiceOrder = {
    id: number;
    created_at?: string | null;
    customer_name?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    pincode?: string | null;
    payment_method?: string | null;
    payment_status?: string | null;
    total_amount?: number | string | null;
    items?: InvoiceItem[] | null;
};

function toNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
    return `₹${value.toFixed(2)}`;
}

function safeText(value: string | null | undefined, fallback: string) {
    const text = value?.trim();
    return text && text.length > 0 ? text : fallback;
}

function ensurePageSpace(pdf: jsPDF, y: number, threshold: number) {
    if (y > threshold) {
        pdf.addPage();
        return 20;
    }

    return y;
}

function getLogoDataUrl() {
    try {
        const logoPath = path.join(process.cwd(), "app", "assests", "brand_new.png");
        const fileBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${fileBuffer.toString("base64")}`;
    } catch {
        return null;
    }
}

export function generateInvoicePdf(order: InvoiceOrder) {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const logoDataUrl = getLogoDataUrl();

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = items.reduce((sum, item) => {
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.price);
        return sum + unitPrice * quantity;
    }, 0);
    const shipping = subtotal > 500 ? 0 : 70;
    const adjustment = order.payment_method === "PREPAID" ? -20 : 0;
    const fallbackTotal = Math.max(0, subtotal + shipping + adjustment);
    const finalTotal = Number.isFinite(Number(order.total_amount)) && Number(order.total_amount) >= 0
        ? Number(order.total_amount)
        : fallbackTotal;

    let y = 18;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    const logoSize = 26;

    if (logoDataUrl) {
        pdf.addImage(logoDataUrl, "PNG", margin, 8, logoSize, logoSize, undefined, "FAST");
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(105, 105, 105);
    pdf.text("Purchase Receipt", pageWidth - margin, 18, { align: "right" });
    pdf.setTextColor(20, 20, 20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`Order #${order.id}`, pageWidth - margin, 28, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(105, 105, 105);
    const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "N/A";
    pdf.text(orderDate, pageWidth - margin, 34, { align: "right" });

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(margin, 42, pageWidth - margin, 42);

    y = 54;
    pdf.setTextColor(20, 20, 20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Customer Details", margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const customerName = safeText(order.customer_name ?? null, "Customer name unavailable");
    const phone = safeText(order.phone ?? null, "Phone unavailable");
    const address = safeText(order.address ?? null, "Address unavailable");
    const city = safeText(order.city ?? null, "City unavailable");
    const pincode = safeText(order.pincode ?? null, "Pincode unavailable");

    y += 8;
    pdf.text(customerName, margin, y);
    y += 6;
    pdf.text(`Phone: ${phone}`, margin, y);
    y += 6;

    const addressLines = pdf.splitTextToSize(address, contentWidth - 6) as string[];
    for (const addressLine of addressLines.slice(0, 3)) {
        pdf.text(addressLine, margin, y);
        y += 5;
    }
    pdf.text(`${city} - ${pincode}`, margin, y);

    y += 12;
    pdf.setFont("helvetica", "bold");
    pdf.text("Order Info", pageWidth / 2 + 8, 54);
    pdf.setFont("helvetica", "normal");
    pdf.text("Document Type", pageWidth / 2 + 8, 63);
    pdf.text("Order Invoice", pageWidth / 2 + 8 + 40, 63);
    pdf.text("Order ID", pageWidth / 2 + 8, 71);
    pdf.text(`#${order.id}`, pageWidth / 2 + 8 + 40, 71);
    pdf.text("Order Date", pageWidth / 2 + 8, 79);
    pdf.text(orderDate, pageWidth / 2 + 8 + 40, 79);
    pdf.text("Payment Method", pageWidth / 2 + 8, 87);
    const methodLabel = order.payment_method === "RAZORPAY"
        ? "Razorpay"
        : order.payment_method === "PREPAID"
            ? "UPI / Prepaid"
            : order.payment_method === "COD"
                ? "Cash on Delivery"
                : safeText(order.payment_method ?? null, "Not specified");
    pdf.text(methodLabel, pageWidth / 2 + 8 + 40, 87);
    pdf.text("Payment Status", pageWidth / 2 + 8, 95);
    pdf.text(safeText(order.payment_status ?? null, "Unknown"), pageWidth / 2 + 8 + 40, 95);

    y = 114;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, y, pageWidth - margin, y);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Items", margin, y + 8);

    y += 15;
    const itemTableY = y;
    const itemX = margin;
    const qtyX = pageWidth - 52;
    const priceX = pageWidth - 95;
    const totalX = pageWidth - margin - 8;

    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, itemTableY, contentWidth, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("PRODUCT", itemX + 2, itemTableY + 5.5);
    pdf.text("QTY", qtyX, itemTableY + 5.5, { align: "right" });
    pdf.text("PRICE", priceX, itemTableY + 5.5, { align: "right" });
    pdf.text("TOTAL", totalX, itemTableY + 5.5, { align: "right" });

    let currentY = itemTableY + 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    for (const item of items) {
        const productName = safeText(item.product_name ?? null, "Product unavailable");
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.price);
        const lineTotal = toNumber(item.line_total) || quantity * unitPrice;

        const wrappedName = pdf.splitTextToSize(productName, 96) as string[];
        const linesUsed = Math.max(1, wrappedName.length);

        if (currentY + linesUsed * 5 + 10 > pageHeight - 60) {
            pdf.addPage();
            currentY = 20;
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, currentY, contentWidth, 8, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(8);
            pdf.text("PRODUCT", itemX + 2, currentY + 5.5);
            pdf.text("QTY", qtyX, currentY + 5.5, { align: "right" });
            pdf.text("PRICE", priceX, currentY + 5.5, { align: "right" });
            pdf.text("TOTAL", totalX, currentY + 5.5, { align: "right" });
            currentY += 10;
        }

        const rowStart = currentY;
        pdf.text(wrappedName[0], itemX + 2, rowStart + 4.5);
        if (wrappedName.length > 1) {
            pdf.text(wrappedName[1], itemX + 2, rowStart + 10.5);
        }

        pdf.text(String(quantity), qtyX, rowStart + 4.5, { align: "right" });
        pdf.text(formatMoney(unitPrice), priceX, rowStart + 4.5, { align: "right" });
        pdf.text(formatMoney(lineTotal), totalX, rowStart + 4.5, { align: "right" });

        currentY += Math.max(12, linesUsed * 5 + 4);
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.2);
        pdf.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
    }

    const summaryY = ensurePageSpace(pdf, currentY + 16, pageHeight - 70);
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, summaryY, pageWidth - margin, summaryY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Subtotal", pageWidth / 2 + 20, summaryY + 9);
    pdf.text(formatMoney(subtotal), pageWidth - margin, summaryY + 9, { align: "right" });
    pdf.text("Shipping", pageWidth / 2 + 20, summaryY + 18);
    pdf.text(shipping === 0 ? "Free" : formatMoney(shipping), pageWidth - margin, summaryY + 18, { align: "right" });
    pdf.text("Adjustment", pageWidth / 2 + 20, summaryY + 27);
    pdf.text(adjustment === 0 ? formatMoney(0) : formatMoney(adjustment), pageWidth - margin, summaryY + 27, { align: "right" });

    pdf.setFillColor(245, 245, 245);
    pdf.rect(pageWidth / 2 + 20, summaryY + 35, 70, 12, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(20, 20, 20);
    pdf.text("Final Total", pageWidth / 2 + 24, summaryY + 43);
    pdf.text(formatMoney(finalTotal), pageWidth - margin, summaryY + 43, { align: "right" });

    pdf.setTextColor(90, 90, 90);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Thank you for shopping with RT18.", margin, pageHeight - 18);
    pdf.text("This is a purchase receipt, not a GST invoice.", pageWidth - margin, pageHeight - 18, { align: "right" });

    return pdf;
}
