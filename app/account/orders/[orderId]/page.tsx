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
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">
                        Loading order...
                    </p>
                </div>
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
        <main className="min-h-screen bg-gray-100 p-4 md:p-8 lg:p-10">

            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-7">

                    <a
                        href="/account/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition"
                    >
                        ← Back to My Orders
                    </a>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-5">

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Order #{order.id}
                                </h1>
                            </div>

                            <p className="text-gray-500 mt-1 text-sm md:text-base">
                                Placed on{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <StatusBadge
                                label={order.order_status}
                            />

                            <span
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${order.payment_status === "PAID"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }`}
                            >
                                {order.payment_status}
                            </span>
                        </div>

                    </div>
                </div>


                {/* ORDER TRACKING */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 mb-6">

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            Order Tracking
                        </h2>

                        <span className="text-xs md:text-sm text-gray-500">
                            {order.order_status}
                        </span>
                    </div>

                    <div className="mt-8">

                        {order.order_status === "CANCELLED" ? (

                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                                        !
                                    </div>

                                    <div>
                                        <p className="font-bold text-red-700">
                                            Order Cancelled
                                        </p>

                                        <p className="text-sm text-red-600 mt-1">
                                            This order has been cancelled.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        ) : (

                            <div className="relative">

                                {/* TRACKING LINE */}
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

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-6 relative">

                                    {steps.map((step, index) => {

                                        const completed =
                                            currentStep >= index;

                                        return (
                                            <div
                                                key={step}
                                                className="flex md:flex-col items-center md:text-center gap-3"
                                            >

                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 border-4 border-white shadow-sm ${completed
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


                {/* CANCELLATION NOTE */}
                {order.order_status !== "CANCELLED" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 mb-6">

                        <div className="flex items-start gap-3">

                            <div className="w-9 h-9 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                !
                            </div>

                            <div>
                                <p className="font-bold text-amber-800">
                                    Order Cancellation Policy
                                </p>

                                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                    Order cancellation is available only
                                    before the order reaches the{" "}
                                    <strong>PACKED</strong> stage.
                                    Once your order has been packed,
                                    cancellation may no longer be possible.
                                </p>
                            </div>

                        </div>

                    </div>
                )}


                {/* PRODUCTS */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 mb-6">

                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            Order Items
                        </h2>

                        <span className="text-sm text-gray-500">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                        </span>
                    </div>

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
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover bg-gray-100 shrink-0"
                                    />

                                ) : (

                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                        📦
                                    </div>

                                )}

                                <div className="flex-1 min-w-0">

                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {item.product_name}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Quantity: {item.quantity}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        ₹{Number(item.price).toFixed(2)} each
                                    </p>

                                </div>

                                <p className="font-bold text-gray-900 text-sm md:text-base shrink-0">
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
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                📍
                            </div>

                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                    Delivery Address
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Shipping information
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">

                            <p className="font-bold text-gray-900">
                                {order.customer_name}
                            </p>

                            <p className="text-gray-600 mt-2 text-sm">
                                📞 {order.phone}
                            </p>

                            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                                {order.address}
                            </p>

                            <p className="text-gray-600 text-sm mt-1">
                                {order.city} - {order.pincode}
                            </p>

                        </div>

                    </div>


                    {/* PAYMENT */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                💳
                            </div>

                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                    Payment Details
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Payment information
                                </p>
                            </div>

                        </div>


                        {/* PAYMENT METHOD */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-3">

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                    Payment Method
                                </p>

                                <p className="font-bold text-gray-900 mt-1">
                                    {order.payment_method === "RAZORPAY"
                                        ? "Razorpay"
                                        : "Cash on Delivery"}
                                </p>
                            </div>

                            <div
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${order.payment_method === "RAZORPAY"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                            >
                                {order.payment_method === "RAZORPAY"
                                    ? "ONLINE"
                                    : "COD"}
                            </div>

                        </div>


                        {/* PAYMENT STATUS */}
                        <div
                            className={`flex items-center justify-between rounded-xl p-4 mb-4 border ${order.payment_status === "PAID"
                                    ? "bg-green-50 border-green-200"
                                    : "bg-yellow-50 border-yellow-200"
                                }`}
                        >

                            <div>
                                <p className="text-xs uppercase tracking-wide font-medium text-gray-500">
                                    Payment Status
                                </p>

                                <p
                                    className={`font-bold mt-1 ${order.payment_status === "PAID"
                                            ? "text-green-700"
                                            : "text-yellow-700"
                                        }`}
                                >
                                    {order.payment_status}
                                </p>
                            </div>

                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${order.payment_status === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {order.payment_status === "PAID"
                                    ? "✓"
                                    : "!"}
                            </div>

                        </div>


                        {/* TOTAL */}
                        <div className="border-t border-gray-200 pt-4 mt-2">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Total Amount
                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">
                                        Including applicable charges
                                    </p>
                                </div>

                                <span className="text-2xl font-extrabold text-gray-900">
                                    ₹
                                    {Number(
                                        order.total_amount
                                    ).toFixed(2)}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* BOTTOM NOTE */}
                <div className="text-center py-8">

                    <p className="text-sm text-gray-500">
                        Thank you for shopping with{" "}
                        <span className="font-bold text-gray-900">
                            RT18
                        </span>
                        .
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        We&apos;ll keep you updated as your order moves
                        through each stage.
                    </p>

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

        PLACED:
            "bg-yellow-100 text-yellow-700 border-yellow-200",

        CONFIRMED:
            "bg-blue-100 text-blue-700 border-blue-200",

        PACKED:
            "bg-purple-100 text-purple-700 border-purple-200",

        SHIPPED:
            "bg-indigo-100 text-indigo-700 border-indigo-200",

        DELIVERED:
            "bg-green-100 text-green-700 border-green-200",

        CANCELLED:
            "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${styles[label] ||
                "bg-gray-100 text-gray-700 border-gray-200"
                }`}
        >
            {label}
        </span>
    );
}