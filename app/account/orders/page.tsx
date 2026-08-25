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
    cancellation_reason: string | null;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
            try {
                const response = await fetch("/api/auth/my-orders");
                const data = await response.json();

                if (!data.success) {
                    window.location.href = "/login";
                    return;
                }

                setOrders(data.orders);
            } catch (error) {
                console.error("My orders error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading your orders...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-10">

            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <a
                        href="/account"
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Back to Account
                    </a>

                    <h1 className="text-3xl font-bold text-gray-900 mt-4">
                        My Orders
                    </h1>

                    <p className="text-gray-500 mt-1">
                        View and track your orders.
                    </p>
                </div>

                {/* EMPTY */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">

                        <div className="text-5xl">
                            📦
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mt-5">
                            No Orders Yet
                        </h2>

                        <p className="text-gray-500 mt-2">
                            You haven't placed any orders yet.
                        </p>

                        <a
                            href="/shop"
                            className="inline-block bg-black text-white px-6 py-3 rounded-xl mt-6"
                        >
                            Start Shopping
                        </a>

                    </div>
                ) : (

                    /* ORDERS */
                    <div className="space-y-6">

                        {orders.map((order) => (

                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                            >

                                {/* ORDER HEADER */}
                                <div className="p-6 border-b border-gray-200">

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Order
                                            </p>

                                            <h2 className="text-xl font-bold text-gray-900">
                                                #{order.id}
                                            </h2>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">

                                            <StatusBadge
                                                label={order.order_status}
                                                type="order"
                                            />

                                            <StatusBadge
                                                label={order.payment_status}
                                                type="payment"
                                            />

                                        </div>

                                    </div>

                                </div>

                                {order.order_status === "CANCELLED" && (
                                    <div className="mx-6 mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                                        <div className="flex items-start gap-4">

                                            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-xl flex-shrink-0">
                                                ❌
                                            </div>

                                            <div className="flex-1">

                                                <h3 className="font-bold text-red-700 text-lg">
                                                    Order Cancelled
                                                </h3>

                                                <p className="text-sm text-red-600 mt-1">
                                                    This order has been cancelled and will not be processed.
                                                </p>

                                                <div className="mt-4 bg-white border border-red-100 rounded-xl p-4">

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                        Cancellation Reason
                                                    </p>

                                                    <p className="font-semibold text-gray-900 mt-1">
                                                        {order.cancellation_reason ||
                                                            "No reason provided"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )}

                                {/* PRODUCTS */}
                                <div className="p-6">

                                    <h3 className="font-bold text-gray-900 mb-4">
                                        Products
                                    </h3>

                                    <div className="space-y-4">

                                        {order.items.map((item, index) => (

                                            <div
                                                key={`${order.id}-${item.product_id}-${index}`}
                                                className="flex items-center gap-4"
                                            >

                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.product_name}
                                                        className="w-16 h-16 object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                                        📦
                                                    </div>
                                                )}

                                                <div className="flex-1">

                                                    <p className="font-semibold text-gray-900">
                                                        {item.product_name}
                                                    </p>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Qty: {item.quantity}
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

                                {/* FOOTER */}
                                <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Payment Method
                                            </p>

                                            <p className="font-semibold text-gray-900">
                                                {order.payment_method === "RAZORPAY"
                                                    ? "Online Payment (Razorpay)"
                                                    : "Cash on Delivery"}
                                            </p>

                                        </div>

                                        <div className="text-left md:text-right">

                                            <p className="text-sm text-gray-500">
                                                Total Amount
                                            </p>

                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹
                                                {Number(
                                                    order.total_amount
                                                ).toFixed(2)}
                                            </p>

                                            <a
                                                href={`/account/orders/${order.id}`}
                                                className="inline-block mt-3 bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold"
                                            >
                                                View Details & Track
                                            </a>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </main>
    );
}

function StatusBadge({
    label,
    type,
}: {
    label: string;
    type: "order" | "payment";
}) {
    const orderStyles: Record<string, string> = {
        PLACED: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        PACKED: "bg-purple-100 text-purple-700",
        SHIPPED: "bg-indigo-100 text-indigo-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    const paymentStyles: Record<string, string> = {
        PAID: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        FAILED: "bg-red-100 text-red-700",
    };

    const styles =
        type === "order"
            ? orderStyles
            : paymentStyles;

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[label] || "bg-gray-100 text-gray-700"
                }`}
        >
            {label}
        </span>
    );
}