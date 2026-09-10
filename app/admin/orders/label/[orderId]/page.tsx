"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import Image from "next/image";
import logo from "../../../../assests/brand_new.png";
import { addShippingLabel, ShippingLabelOrder } from "@/lib/shipping-label";

type Order = ShippingLabelOrder;

async function imageToDataUrl(source: string) {
    const response = await fetch(source);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function LabelPage({ params }: { params: Promise<{ orderId: string }> }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(({ orderId }) => {
            fetch("/api/orders", { cache: "no-store" })
                .then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "Unable to load order");
                    return data as Order[];
                })
                .then((orders) => setOrder(orders.find((item) => item.id === Number(orderId)) || null))
                .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load order"));
        });
    }, [params]);

    async function downloadLabel() {
        if (!order) return;
        const [logoDataUrl, qrDataUrl] = await Promise.all([
            imageToDataUrl(logo.src),
            QRCode.toDataURL(`RT18-ORDER-${order.id}`, { margin: 0, width: 256 }),
        ]);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        addShippingLabel(pdf, order, { logoDataUrl, qrDataUrl });
        pdf.save(`RT18-Shipping-Label-${order.id}.pdf`);
    }

    if (error) return <p className="p-8 text-red-700">{error}</p>;
    if (!order) return <p className="p-8 text-gray-900">Loading...</p>;

    return <main className="min-h-screen bg-gray-200 p-8">
        <div className="max-w-3xl mx-auto bg-white border-2 border-black p-8 text-gray-900">
            <div className="flex items-start justify-between border-b-2 border-black pb-5">
                <div><Image src={logo} alt="RT18" width={120} height={48} className="h-12 w-auto object-contain" /><p className="text-xs tracking-widest text-gray-500 mt-2">ONLINE ORDER / E-COMMERCE DELIVERY</p></div>
                <div className="text-right"><p className="text-2xl font-bold">ORDER #{order.id}</p><p className="text-sm text-gray-500 mt-1">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : ""}</p></div>
            </div>
            <section className="border-b border-gray-300 py-6"><p className="text-xs font-bold tracking-widest text-gray-500">SHIP TO</p><p className="text-2xl font-bold mt-3">{order.customer_name}</p><p className="font-semibold mt-2">Phone: {order.phone}</p><p className="mt-3">{order.address}</p><p>{order.city} - {order.pincode}</p></section>
            <section className="border-b border-gray-300 py-6"><p className="text-xs font-bold tracking-widest text-gray-500 mb-4">ORDER ITEMS</p><div className="grid grid-cols-[1fr_60px_90px_90px] gap-3 bg-gray-100 p-3 text-xs font-bold"><span>PRODUCT</span><span>QTY</span><span>PRICE</span><span>TOTAL</span></div>{order.items.map((item, index) => <div key={`${item.product_name}-${index}`} className="grid grid-cols-[1fr_60px_90px_90px] gap-3 p-3 border-b border-gray-200 text-sm"><span>{item.product_name}</span><span>{item.quantity}</span><span>Rs. {Number(item.price).toFixed(2)}</span><span>Rs. {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span></div>)}</section>
            <section className="grid grid-cols-2 gap-8 py-6"><div><p className="text-xs font-bold tracking-widest text-gray-500">PAYMENT</p><p className="font-bold mt-3">{order.payment_method === "COD" ? "CASH ON DELIVERY" : "PREPAID"}</p>{order.payment_method !== "COD" && <p className="text-sm text-gray-500 mt-1">Status: {order.payment_status}</p>}</div><div className="text-right"><p className="text-xs font-bold tracking-widest text-gray-500">ORDER TOTAL</p><p className="text-2xl font-bold mt-3">Rs. {Number(order.total_amount).toFixed(2)}</p></div></section>
            <div className="border-t-2 border-black pt-5 flex items-center justify-between"><p><strong>RT18</strong><br /><span className="text-sm text-gray-500">Thank you for shopping with us.</span></p><button onClick={() => void downloadLabel()} className="bg-black text-white px-8 py-3 rounded-lg">Download Label PDF</button></div>
        </div>
    </main>;
}
