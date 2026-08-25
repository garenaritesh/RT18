"use client";

import { useEffect, useState } from "react";

type OrderItem = {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    image_url: string | null;
};

type Order = {
    id: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    total_amount: number;
    created_at: string;
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    items: OrderItem[];
};

export default function OrderDetailsPage() {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrder() {
            try {
                const orderId = window.location.pathname.split("/").pop();

                const response = await fetch(
                    `/api/auth/my-orders/${orderId}`
                );

                const data = await response.json();

                if (!data.success) {
                    window.location.href = "/account/orders";
                    return;
                }

                setOrder(data.order);
            } catch (error) {
                console.error("Order details error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading order...
                </p>
            </main>
        );
    }

    if (!order) {
        return null;
    }

    const steps = [
        "PLACED",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
    ];

    const currentStep = steps.indexOf(
        order.order_status
    );

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-10">

            <div className="max-w-5xl mx-auto">

                {/* HEADER */}

                <div className="mb-8">

                    <a
                        href="/account/orders"
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Back to My Orders
                    </a>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Order #{order.id}
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Placed on{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-2">

                            <StatusBadge
                                label={order.order_status}
                            />

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${order.payment_status === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {order.payment_status}
                            </span>

                        </div>

                    </div>

                </div>

                {/* ORDER TRACKING */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

                    <h2 className="text-xl font-bold text-gray-900">
                        Order Tracking
                    </h2>

                    <div className="mt-8">

                        {order.order_status === "CANCELLED" ? (

                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                <p className="font-bold text-red-700">
                                    Order Cancelled
                                </p>

                                <p className="text-sm text-red-600 mt-1">
                                    This order has been cancelled.
                                </p>
                            </div>

                        ) : (

                            <div className="relative">

                                <div className="hidden md:block absolute top-5 left-10 right-10 h-1 bg-gray-200" />

                                <div
                                    className="hidden md:block absolute top-5 left-10 h-1 bg-black transition-all"
                                    style={{
                                        width:
                                            currentStep <= 0
                                                ? "0%"
                                                : `${Math.min(
                                                    (currentStep /
                                                        (steps.length - 1)) *
                                                    100,
                                                    100
                                                )}%`,
                                    }}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">

                                    {steps.map((step, index) => {

                                        const completed =
                                            currentStep >= index;

                                        return (
                                            <div
                                                key={step}
                                                className="flex md:flex-col items-center md:text-center gap-3"
                                            >

                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 ${completed
                                                            ? "bg-black text-white"
                                                            : "bg-gray-200 text-gray-500"
                                                        }`}
                                                >
                                                    {completed
                                                        ? "✓"
                                                        : index + 1}
                                                </div>

                                                <div>
                                                    <p
                                                        className={`text-sm font-semibold ${completed
                                                                ? "text-gray-900"
                                                                : "text-gray-400"
                                                            }`}
                                                    >
                                                        {step}
                                                    </p>
                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>

                            </div>
                        )}

                    </div>

                </div>

                {/* PRODUCTS */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

                    <h2 className="text-xl font-bold text-gray-900 mb-5">
                        Order Items
                    </h2>

                    <div className="space-y-5">

                        {order.items.map((item, index) => (

                            <div
                                key={`${item.product_id}-${index}`}
                                className="flex items-center gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                            >

                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.product_name}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                                        📦
                                    </div>
                                )}

                                <div className="flex-1">

                                    <h3 className="font-semibold text-gray-900">
                                        {item.product_name}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Quantity: {item.quantity}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        ₹{Number(item.price).toFixed(2)} each
                                    </p>

                                </div>

                                <p className="font-bold text-gray-900">
                                    ₹
                                    {(
                                        Number(item.price) *
                                        Number(item.quantity)
                                    ).toFixed(2)}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

                {/* CUSTOMER + PAYMENT */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* DELIVERY */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <h2 className="text-xl font-bold text-gray-900 mb-5">
                            Delivery Address
                        </h2>

                        <p className="font-semibold text-gray-900">
                            {order.customer_name}
                        </p>

                        <p className="text-gray-600 mt-2">
                            {order.phone}
                        </p>

                        <p className="text-gray-600 mt-2">
                            {order.address}
                        </p>

                        <p className="text-gray-600">
                            {order.city} - {order.pincode}
                        </p>

                    </div>

                    {/* PAYMENT */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <h2 className="text-xl font-bold text-gray-900 mb-5">
                            Payment Details
                        </h2>

                        <div className="flex justify-between mb-3">

                            <span className="text-gray-500">
                                Method
                            </span>

                            <span className="font-semibold">
                                {order.payment_method === "RAZORPAY"
                                    ? "Razorpay"
                                    : "Cash on Delivery"}
                            </span>

                        </div>

                        <div className="flex justify-between mb-3">

                            <span className="text-gray-500">
                                Payment Status
                            </span>

                            <span className="font-semibold">
                                {order.payment_status}
                            </span>

                        </div>

                        <div className="border-t pt-4 mt-4 flex justify-between">

                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-xl font-bold">
                                ₹{Number(
                                    order.total_amount
                                ).toFixed(2)}
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}

function StatusBadge({
    label,
}: {
    label: string;
}) {
    const styles: Record<string, string> = {
        PLACED: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        PACKED: "bg-purple-100 text-purple-700",
        SHIPPED: "bg-indigo-100 text-indigo-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[label] ||
                "bg-gray-100 text-gray-700"
                }`}
        >
            {label}
        </span>
    );
}