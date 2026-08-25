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
    customer_name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    total_amount: number;
    items: OrderItem[];
    created_at: string;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

    async function loadOrders() {
        try {
            const response = await fetch("/api/orders");
            const data = await response.json();

            const sortedOrders = [...data].sort((a, b) => {
                if (
                    a.order_status === "CANCELLED" &&
                    b.order_status !== "CANCELLED"
                ) {
                    return 1;
                }

                if (
                    a.order_status !== "CANCELLED" &&
                    b.order_status === "CANCELLED"
                ) {
                    return -1;
                }

                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            });

            setOrders(sortedOrders);
        } catch (error) {
            console.error("Orders loading error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function updateStatus(id: number, status: string) {
        try {
            await fetch("/api/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    status,
                }),
            });

            loadOrders();
        } catch (error) {
            console.error("Update status error:", error);
        }
    }

    async function cancelOrder(id: number, reason: string) {
        try {
            const response = await fetch("/api/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    status: "CANCELLED",
                    cancellationReason: reason,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setCancelOrderId(null);
                alert("Order cancelled successfully");
                loadOrders();
            } else {
                alert(data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Cancel order error:", error);
            alert("Something went wrong");
        }
    }

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => order.order_status === "PLACED"
    ).length;

    const confirmedOrders = orders.filter(
        (order) => order.order_status === "CONFIRMED"
    ).length;

    const shippedOrders = orders.filter(
        (order) => order.order_status === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.order_status === "DELIVERED"
    ).length;

    const cancelledOrders = orders.filter(
        (order) => order.order_status === "CANCELLED"
    ).length;

    return (
        <main className="relative">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage and track all customer orders.
                    </p>

                </div>

                <button
                    onClick={loadOrders}
                    className="bg-black text-white px-5 py-3 rounded-xl"
                >
                    Refresh Orders
                </button>

            </div>

            {/* ORDER STATS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

                <StatCard
                    title="Total"
                    value={totalOrders}
                    icon="📦"
                />

                <StatCard
                    title="Pending"
                    value={pendingOrders}
                    icon="⏳"
                />

                <StatCard
                    title="Confirmed"
                    value={confirmedOrders}
                    icon="✓"
                />

                <StatCard
                    title="Shipped"
                    value={shippedOrders}
                    icon="🚚"
                />

                <StatCard
                    title="Delivered"
                    value={deliveredOrders}
                    icon="✅"
                />

                <StatCard
                    title="Cancelled"
                    value={cancelledOrders}
                    icon="✕"
                />

            </div>

            {/* ORDERS */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-xl font-bold text-gray-900">
                        All Orders
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Latest orders are shown first.
                    </p>

                </div>

                {loading ? (

                    <div className="p-10 text-center text-gray-500">
                        Loading orders...
                    </div>

                ) : orders.length === 0 ? (

                    <div className="p-10 text-center text-gray-500">
                        No orders found.
                    </div>

                ) : (

                    <div className="divide-y divide-gray-200">

                        {orders.map((order) => (

                            <div
                                key={order.id}
                                className="p-6 hover:bg-gray-50 transition"
                            >

                                {/* TOP */}

                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                                    <div>

                                        <div className="flex items-center gap-3">

                                            <h3 className="text-lg font-bold text-gray-900">
                                                Order #{order.id}
                                            </h3>

                                            <StatusBadge
                                                status={order.order_status}
                                            />

                                        </div>

                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                    <div className="text-left lg:text-right">

                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹
                                            {Number(
                                                order.total_amount
                                            ).toFixed(2)}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {order.payment_method === "COD"
                                                ? "Cash on Delivery"
                                                : "Online Payment"}
                                        </p>

                                    </div>

                                </div>

                                {/* CUSTOMER + STATUS */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                                    {/* CUSTOMER */}

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <p className="text-xs font-semibold text-gray-500 uppercase">
                                            Customer
                                        </p>

                                        <p className="font-bold text-gray-900 mt-2">
                                            {order.customer_name}
                                        </p>

                                        <p className="text-gray-700 mt-1">
                                            {order.phone}
                                        </p>

                                        <p className="text-gray-600 mt-2">
                                            {order.address}, {order.city} -{" "}
                                            {order.pincode}
                                        </p>

                                    </div>

                                    {/* STATUS */}

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <p className="text-xs font-semibold text-gray-500 uppercase">
                                            Order Status
                                        </p>

                                        <select
                                            value={order.order_status}
                                            onChange={(e) =>
                                                updateStatus(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full mt-3 border border-gray-300 p-3 rounded-xl text-gray-900 bg-white"
                                        >

                                            <option value="PLACED">
                                                Placed
                                            </option>

                                            <option value="CONFIRMED">
                                                Confirmed
                                            </option>

                                            <option value="PACKED">
                                                Packed
                                            </option>

                                            <option value="SHIPPED">
                                                Shipped
                                            </option>

                                            <option value="DELIVERED">
                                                Delivered
                                            </option>

                                            <option value="CANCELLED">
                                                Cancelled
                                            </option>

                                        </select>

                                        {/* CANCEL BUTTON */}

                                        {order.order_status !== "CANCELLED" &&
                                            order.order_status !== "DELIVERED" && (

                                                <button
                                                    onClick={() =>
                                                        setCancelOrderId(
                                                            order.id
                                                        )
                                                    }
                                                    className="w-full mt-3 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition"
                                                >
                                                    Cancel Order
                                                </button>

                                            )}

                                        {/* SHIPPING LABEL */}

                                        <button
                                            onClick={() =>
                                                window.open(
                                                    `/admin/orders/label/${order.id}`,
                                                    "_blank"
                                                )
                                            }
                                            className="w-full mt-3 bg-black text-white py-3 rounded-xl"
                                        >
                                            Generate Shipping Label
                                        </button>

                                    </div>

                                </div>

                                {/* PRODUCTS */}

                                <div className="mt-6">

                                    <p className="text-sm font-bold text-gray-900 mb-3">
                                        Ordered Products
                                    </p>

                                    <div className="space-y-3">

                                        {order.items.map(
                                            (item, index) => (

                                                <div
                                                    key={`${order.id}-${item.product_id}-${index}`}
                                                    className="flex items-center gap-4 border border-gray-200 rounded-xl p-3"
                                                >

                                                    {item.image_url ? (

                                                        <img
                                                            src={item.image_url}
                                                            alt={item.product_name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />

                                                    ) : (

                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            📦
                                                        </div>

                                                    )}

                                                    <div className="flex-1">

                                                        <p className="font-semibold text-gray-900">
                                                            {item.product_name}
                                                        </p>

                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Qty: {item.quantity} × ₹
                                                            {Number(
                                                                item.price
                                                            ).toFixed(2)}
                                                        </p>

                                                    </div>

                                                    <p className="font-bold text-gray-900">
                                                        ₹
                                                        {(
                                                            Number(
                                                                item.price
                                                            ) *
                                                            Number(
                                                                item.quantity
                                                            )
                                                        ).toFixed(2)}
                                                    </p>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* CANCEL POPUP */}

            {cancelOrderId !== null && (

                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5">

                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">

                        <h2 className="text-xl font-bold text-gray-900">
                            Cancel Order
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Select the reason for cancelling this order.
                        </p>

                        <div className="space-y-3 mt-5">

                            {[
                                "Out of Stock",
                                "Technical Issue",
                                "Product Unavailable",
                                "Delivery Issue",
                                "Payment Issue",
                                "Other",
                            ].map((reason) => (

                                <button
                                    key={reason}
                                    onClick={() =>
                                        cancelOrder(
                                            cancelOrderId,
                                            reason
                                        )
                                    }
                                    className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 text-gray-900 hover:bg-gray-100 transition"
                                >
                                    {reason}
                                </button>

                            ))}

                        </div>

                        <button
                            onClick={() =>
                                setCancelOrderId(null)
                            }
                            className="w-full mt-5 border border-gray-300 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100"
                        >
                            Keep Order
                        </button>

                    </div>

                </div>

            )}

        </main>
    );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: string;
}) {
    return (

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {value}
                    </p>

                </div>

                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                    {icon}
                </div>

            </div>

        </div>

    );
}


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
    status,
}: {
    status: string;
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
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] ||
                "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>

    );
}