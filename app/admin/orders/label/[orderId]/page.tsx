"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

type Order = {
    id: number;
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    payment_method: string;
    total_amount: number;
    order_status: string;
};

export default function LabelPage({
    params,
}: {
    params: Promise<{ orderId: string }>;
}) {
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        params.then(({ orderId }) => {
            fetch("/api/orders")
                .then((res) => res.json())
                .then((orders) => {
                    const found = orders.find(
                        (item: Order) => item.id === Number(orderId)
                    );

                    setOrder(found || null);
                });
        });
    }, [params]);

    async function downloadLabel() {
        if (!order) return;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        pdf.setDrawColor(0);
        pdf.setLineWidth(0.6);

        // Outer border
        pdf.rect(15, 15, 180, 267);

        // Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(24);

        pdf.text("RT18", 105, 32, {
            align: "center",
        });

        pdf.setFontSize(12);

        pdf.text("SHIPPING LABEL", 105, 40, {
            align: "center",
        });

        pdf.line(20, 48, 190, 48);

        // Ship To
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");

        pdf.text("SHIP TO:", 25, 62);

        pdf.setFontSize(18);

        pdf.text(order.customer_name, 25, 74);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        const addressLines = pdf.splitTextToSize(
            order.address,
            155
        );

        pdf.text(addressLines, 25, 84);

        const addressHeight =
            addressLines.length * 6;

        const cityY = 84 + addressHeight + 4;

        pdf.text(
            `${order.city} - ${order.pincode}`,
            25,
            cityY
        );

        pdf.text(
            `Phone: ${order.phone}`,
            25,
            cityY + 8
        );

        // Order information
        const infoY = cityY + 25;

        pdf.line(20, infoY, 190, infoY);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text("ORDER DETAILS", 25, infoY + 15);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        pdf.text(
            `Order ID: #${order.id}`,
            25,
            infoY + 28
        );

        pdf.text(
            `Payment: ${order.payment_method === "COD"
                ? "COD"
                : "PREPAID"
            }`,
            25,
            infoY + 38
        );

        pdf.text(
            `Amount: Rs. ${Number(
                order.total_amount
            ).toFixed(2)}`,
            25,
            infoY + 48
        );

        pdf.text(
            `Status: ${order.order_status}`,
            25,
            infoY + 58
        );

        // Bottom
        const bottomY = 230;

        pdf.line(20, bottomY, 190, bottomY);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);

        pdf.text(
            `ORDER #${order.id}`,
            105,
            bottomY + 22,
            {
                align: "center",
            }
        );

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "RT18 • Thank you for your order",
            105,
            bottomY + 32,
            {
                align: "center",
            }
        );

        pdf.save(
            `RT18-Shipping-Label-${order.id}.pdf`
        );
    }

    if (!order) {
        return (
            <p className="p-8 text-gray-900">
                Loading...
            </p>
        );
    }

    return (
        <main className="min-h-screen bg-gray-200 p-8">

            <div className="max-w-2xl mx-auto bg-white border-2 border-black p-8 text-gray-900">

                <div className="text-center border-b-2 border-black pb-4">

                    <h1 className="text-3xl font-bold">
                        RT18
                    </h1>

                    <p>
                        SHIPPING LABEL
                    </p>

                </div>

                <div className="mt-6">

                    <p className="font-bold">
                        SHIP TO:
                    </p>

                    <p className="text-xl font-bold mt-2">
                        {order.customer_name}
                    </p>

                    <p>
                        {order.address}
                    </p>

                    <p>
                        {order.city} - {order.pincode}
                    </p>

                    <p>
                        Phone: {order.phone}
                    </p>

                </div>

                <div className="border-t border-black mt-6 pt-5">

                    <p>
                        <strong>Order ID:</strong>{" "}
                        #{order.id}
                    </p>

                    <p>
                        <strong>Payment:</strong>{" "}
                        {order.payment_method === "COD"
                            ? "COD"
                            : "PREPAID"}
                    </p>

                    <p>
                        <strong>Amount:</strong>{" "}
                        ₹{order.total_amount}
                    </p>

                    <p>
                        <strong>Status:</strong>{" "}
                        {order.order_status}
                    </p>

                </div>

                <div className="border-t-2 border-black mt-6 pt-6 text-center">

                    <p className="font-bold text-2xl">
                        ORDER #{order.id}
                    </p>

                    <button
                        onClick={downloadLabel}
                        className="mt-6 bg-black text-white px-8 py-3 rounded-lg"
                    >
                        Download Label PDF
                    </button>

                </div>

            </div>

        </main>
    );
}