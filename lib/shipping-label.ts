import jsPDF from "jspdf";

export type ShippingLabelItem = {
    product_name: string;
    quantity: number;
    price: number;
};

export type ShippingLabelOrder = {
    id: number;
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    payment_method: string;
    payment_status?: string;
    total_amount: number;
    order_status: string;
    created_at?: string;
    items: ShippingLabelItem[];
};

function money(value: number) {
    return `Rs. ${value.toFixed(2)}`;
}

function writeWrapped(pdf: jsPDF, text: string, x: number, y: number, width: number, lineHeight: number) {
    const lines = pdf.splitTextToSize(text, width) as string[];
    pdf.text(lines, x, y, { maxWidth: width });
    return y + lines.length * lineHeight;
}

function addRule(pdf: jsPDF, y: number) {
    pdf.setDrawColor(190, 190, 190);
    pdf.setLineWidth(0.25);
    pdf.line(20, y, 190, y);
}

export function addShippingLabel(
    pdf: jsPDF,
    order: ShippingLabelOrder,
    options: { logoDataUrl?: string; qrDataUrl?: string } = {}
) {
    const pageWidth = 210;
    const left = 20;
    const right = 190;
    const contentWidth = right - left;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, 297, "F");
    pdf.setDrawColor(35, 35, 35);
    pdf.setLineWidth(0.8);
    pdf.rect(12, 12, 186, 273);

    if (options.logoDataUrl) {
        pdf.addImage(options.logoDataUrl, "PNG", left, 20, 30, 13, undefined, "FAST");
    } else {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(20, 20, 20);
        pdf.text("RT18", left, 31);
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(95, 95, 95);
    pdf.text("ONLINE ORDER  /  E-COMMERCE DELIVERY", left, 39);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.setTextColor(20, 20, 20);
    pdf.text(`ORDER #${order.id}`, 160, 27, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(95, 95, 95);
    pdf.text(order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "", 160, 35, { align: "right" });

    if (options.qrDataUrl) {
        pdf.addImage(options.qrDataUrl, "PNG", 169, 40, 16, 16, undefined, "FAST");
    }
    addRule(pdf, 47);

    pdf.setTextColor(25, 25, 25);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("SHIP TO", left, 58);
    pdf.setFontSize(15);
    pdf.text(order.customer_name, left, 69);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`Phone: ${order.phone}`, left, 77);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    let addressY = writeWrapped(pdf, order.address, left, 87, contentWidth - 8, 4.8);
    addressY = writeWrapped(pdf, `${order.city} - ${order.pincode}`, left, addressY + 1, contentWidth - 8, 4.8);
    const itemsTop = Math.max(addressY + 9, 106);

    addRule(pdf, itemsTop);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("ORDER ITEMS", left, itemsTop + 11);
    const tableTop = itemsTop + 17;
    const productX = left;
    const qtyX = 143;
    const priceX = 166;
    const totalX = right;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(left, tableTop - 6, contentWidth, 9, "F");
    pdf.setFontSize(7.5);
    pdf.text("PRODUCT", productX + 3, tableTop);
    pdf.text("QTY", qtyX, tableTop, { align: "right" });
    pdf.text("PRICE", priceX, tableTop, { align: "right" });
    pdf.text("TOTAL", totalX - 3, tableTop, { align: "right" });

    let rowY = tableTop + 8;
    const rowFontSize = order.items.length > 12 ? 6.5 : 8;
    const rowHeight = order.items.length > 12 ? 5.5 : 7.5;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(35, 35, 35);
    pdf.setFontSize(rowFontSize);
    for (const item of order.items) {
        const productLines = pdf.splitTextToSize(item.product_name, 112) as string[];
        const displayLines = productLines.slice(0, 2);
        pdf.text(displayLines, productX + 3, rowY);
        pdf.text(String(item.quantity), qtyX, rowY, { align: "right" });
        pdf.text(money(Number(item.price)), priceX, rowY, { align: "right" });
        pdf.text(money(Number(item.price) * Number(item.quantity)), totalX - 3, rowY, { align: "right" });
        rowY += Math.max(rowHeight, displayLines.length * (rowFontSize / 2.2) + 2);
        pdf.setDrawColor(225, 225, 225);
        pdf.setLineWidth(0.2);
        pdf.line(left, rowY - 2, right, rowY - 2);
    }

    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 70;
    const discount = Math.max(0, subtotal + shipping - Number(order.total_amount));
    const summaryTop = Math.max(rowY + 5, 188);
    addRule(pdf, summaryTop);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(25, 25, 25);
    pdf.text("PAYMENT", left, summaryTop + 11);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(order.payment_method === "COD" ? "CASH ON DELIVERY" : "PREPAID", left, summaryTop + 20);
    if (order.payment_method !== "COD" && order.payment_status) {
        pdf.setFontSize(8);
        pdf.setTextColor(95, 95, 95);
        pdf.text(`Status: ${order.payment_status}`, left, summaryTop + 28);
    }

    const summaryX = 130;
    pdf.setTextColor(35, 35, 35);
    pdf.setFontSize(8.5);
    pdf.text("Subtotal", summaryX, summaryTop + 11);
    pdf.text(money(subtotal), right - 3, summaryTop + 11, { align: "right" });
    pdf.text("Shipping", summaryX, summaryTop + 19);
    pdf.text(shipping === 0 ? "FREE" : money(shipping), right - 3, summaryTop + 19, { align: "right" });
    if (discount > 0) {
        pdf.text("Discount / Offer", summaryX, summaryTop + 27);
        pdf.text(`- ${money(discount)}`, right - 3, summaryTop + 27, { align: "right" });
    }
    const totalY = summaryTop + (discount > 0 ? 39 : 31);
    pdf.setFillColor(25, 25, 25);
    pdf.roundedRect(summaryX - 4, totalY - 7, right - summaryX + 7, 15, 1.5, 1.5, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("ORDER TOTAL", summaryX, totalY + 2);
    pdf.setFontSize(12);
    pdf.text(money(Number(order.total_amount)), right - 3, totalY + 2, { align: "right" });

    const footerY = 268;
    addRule(pdf, footerY - 8);
    pdf.setTextColor(35, 35, 35);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("RT18", left, footerY);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text("Thank you for shopping with us.", left + 18, footerY);
    pdf.setFontSize(7.5);
    pdf.text(order.order_status, right, footerY, { align: "right" });
    pdf.setTextColor(0, 0, 0);
}
