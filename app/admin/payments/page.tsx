"use client";

import { useEffect, useState } from "react";

type Order = {
    id: number;
    customer_name: string;
    payment_method: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
};

export default function PaymentsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadPayments() {
        try {
            const response = await fetch("/api/orders");
            const data = await response.json();

            setOrders(data);
        } catch (error) {
            console.error("Payments loading error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPayments();
    }, []);

    const paidOrders = orders.filter(
        (order) => order.payment_status === "PAID"
    );

    const totalPayments = orders.length;

    const paidPayments = paidOrders.length;

    const pendingPayments = orders.filter(
        (order) => order.payment_status === "PENDING"
    ).length;

    const codPayments = orders.filter(
        (order) => order.payment_method === "COD"
    ).length;

    const razorpayPayments = orders.filter(
        (order) => order.payment_method === "RAZORPAY"
    ).length;

    function getAmountForDays(days: number) {
        const now = new Date();

        const startDate = new Date();

        startDate.setDate(now.getDate() - days);

        return paidOrders
            .filter((order) => {
                const orderDate = new Date(order.created_at);

                return orderDate >= startDate && orderDate <= now;
            })
            .reduce(
                (total, order) =>
                    total + Number(order.total_amount),
                0
            );
    }

    const todayAmount = getAmountForDays(1);

    const last7DaysAmount = getAmountForDays(7);

    const last30DaysAmount = getAmountForDays(30);

    const allTimeAmount = paidOrders.reduce(
        (total, order) =>
            total + Number(order.total_amount),
        0
    );

    return (
        <main>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Payments
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Track your store payments and revenue.
                    </p>
                </div>

                <button
                    onClick={loadPayments}
                    className="bg-black text-white px-5 py-3 rounded-xl"
                >
                    Refresh Payments
                </button>
            </div>

            {/* REVENUE */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                {/* TODAY */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Today
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{todayAmount.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        Paid payments received today
                    </p>
                </div>

                {/* 7 DAYS */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Last 7 Days
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{last7DaysAmount.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        Paid payments in the last 7 days
                    </p>
                </div>

                {/* 30 DAYS */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Last 30 Days
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{last30DaysAmount.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        Paid payments in the last 30 days
                    </p>
                </div>

                {/* ALL TIME */}
                <div className="bg-black text-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-300">
                        All Time Revenue
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        ₹{allTimeAmount.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                        Total paid amount
                    </p>
                </div>

            </div>

            {/* PAYMENT STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

                <StatCard
                    title="Total Payments"
                    value={totalPayments}
                />

                <StatCard
                    title="Paid"
                    value={paidPayments}
                />

                <StatCard
                    title="Pending"
                    value={pendingPayments}
                />

                <StatCard
                    title="COD Orders"
                    value={codPayments}
                />

                <StatCard
                    title="Razorpay"
                    value={razorpayPayments}
                />

            </div>

            {/* PAYMENT HISTORY */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Payment History
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Latest payment activity.
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading payments...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No payments found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">

                        {orders.map((order) => {
                            const isPaid =
                                order.payment_status === "PAID";

                            return (
                                <div
                                    key={order.id}
                                    className="p-5 hover:bg-gray-50 transition"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                                        {/* ORDER */}
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">
                                                Order #{order.id}
                                            </p>

                                            <p className="text-sm text-gray-600 mt-1">
                                                {order.customer_name}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* AMOUNT */}
                                        <div className="w-32">
                                            <p className="text-xs text-gray-500">
                                                Amount
                                            </p>

                                            <p className="font-bold text-gray-900 mt-1">
                                                ₹
                                                {Number(
                                                    order.total_amount
                                                ).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* METHOD */}
                                        <div className="w-36">
                                            <p className="text-xs text-gray-500">
                                                Method
                                            </p>

                                            <p className="font-semibold text-gray-900 mt-1">
                                                {order.payment_method ===
                                                    "RAZORPAY"
                                                    ? "Razorpay"
                                                    : "Cash on Delivery"}
                                            </p>
                                        </div>

                                        {/* STATUS */}
                                        <div className="w-28">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isPaid
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {order.payment_status}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </main>
    );
}

function StatCard({
    title,
    value,
}: {
    title: string;
    value: number;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
                {value}
            </p>
        </div>
    );
}