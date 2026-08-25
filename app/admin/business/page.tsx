"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
    id: number;
    order_status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
};

type Product = {
    id: number;
};

type Period = "YESTERDAY" | "7DAYS" | "30DAYS" | "CUSTOM";

export default function BusinessPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [period, setPeriod] = useState<Period>("7DAYS");
    const [view, setView] = useState<"ORDERS" | "SALES">("ORDERS");

    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const [loading, setLoading] = useState(true);

    async function loadData() {
        try {
            const [ordersResponse, productsResponse] =
                await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/products"),
                ]);

            const ordersData = await ordersResponse.json();
            const productsData = await productsResponse.json();

            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error("Business dashboard error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function getDateRange() {
        const today = new Date();

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);

        const start = new Date(today);

        if (period === "YESTERDAY") {
            start.setDate(today.getDate() - 1);
            start.setHours(0, 0, 0, 0);

            end.setDate(today.getDate() - 1);
            end.setHours(23, 59, 59, 999);
        }

        if (period === "7DAYS") {
            start.setDate(today.getDate() - 6);
            start.setHours(0, 0, 0, 0);
        }

        if (period === "30DAYS") {
            start.setDate(today.getDate() - 29);
            start.setHours(0, 0, 0, 0);
        }

        if (period === "CUSTOM") {
            if (customStart) {
                const customStartDate = new Date(customStart);
                customStartDate.setHours(0, 0, 0, 0);
                start.setTime(customStartDate.getTime());
            }

            if (customEnd) {
                const customEndDate = new Date(customEnd);
                customEndDate.setHours(23, 59, 59, 999);
                end.setTime(customEndDate.getTime());
            }
        }

        return { start, end };
    }

    const filteredOrders = useMemo(() => {
        const { start, end } = getDateRange();

        return orders.filter((order) => {
            const date = new Date(order.created_at);

            return date >= start && date <= end;
        });
    }, [orders, period, customStart, customEnd]);

    const paidOrders = filteredOrders.filter(
        (order) => order.payment_status === "PAID"
    );

    const totalOrders = filteredOrders.length;

    const totalSales = paidOrders.reduce(
        (total, order) => total + Number(order.total_amount),
        0
    );

    const cancelledOrders = filteredOrders.filter(
        (order) => order.order_status === "CANCELLED"
    ).length;

    const returnPercentage =
        totalOrders > 0
            ? (cancelledOrders / totalOrders) * 100
            : 0;

    const chartData = useMemo(() => {
        const { start, end } = getDateRange();

        const days: {
            date: Date;
            label: string;
            orders: number;
            sales: number;
        }[] = [];

        const current = new Date(start);

        while (current <= end) {
            days.push({
                date: new Date(current),
                label: current.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                }),
                orders: 0,
                sales: 0,
            });

            current.setDate(current.getDate() + 1);
        }

        filteredOrders.forEach((order) => {
            const orderDate = new Date(order.created_at);

            const day = days.find(
                (item) =>
                    item.date.getFullYear() === orderDate.getFullYear() &&
                    item.date.getMonth() === orderDate.getMonth() &&
                    item.date.getDate() === orderDate.getDate()
            );

            if (day) {
                day.orders += 1;

                if (order.payment_status === "PAID") {
                    day.sales += Number(order.total_amount);
                }
            }
        });

        return days;
    }, [filteredOrders, period, customStart, customEnd]);

    const maxValue = Math.max(
        ...chartData.map((item) =>
            view === "ORDERS" ? item.orders : item.sales
        ),
        1
    );

    function getPeriodText() {
        if (period === "YESTERDAY") {
            return "Yesterday";
        }

        if (period === "7DAYS") {
            return "Last 7 Days";
        }

        if (period === "30DAYS") {
            return "Last 30 Days";
        }

        if (customStart && customEnd) {
            return `${customStart} - ${customEnd}`;
        }

        return "Custom Date";
    }

    if (loading) {
        return (
            <div className="text-gray-500">
                Loading business dashboard...
            </div>
        );
    }

    return (
        <main>
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Business Dashboard
                </h1>
            </div>

            {/* OVERVIEW HEADER */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Business Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {getPeriodText()}
                        </p>
                    </div>

                    {/* DATE BUTTONS */}
                    <div className="flex flex-wrap border border-gray-200 rounded-xl overflow-hidden">

                        <button
                            onClick={() => setPeriod("YESTERDAY")}
                            className={`px-5 py-3 text-sm ${period === "YESTERDAY"
                                    ? "bg-gray-100 font-semibold"
                                    : "bg-white"
                                }`}
                        >
                            Yesterday
                        </button>

                        <button
                            onClick={() => setPeriod("7DAYS")}
                            className={`px-5 py-3 text-sm ${period === "7DAYS"
                                    ? "bg-gray-100 font-semibold"
                                    : "bg-white"
                                }`}
                        >
                            Last 7 Days
                        </button>

                        <button
                            onClick={() => setPeriod("30DAYS")}
                            className={`px-5 py-3 text-sm ${period === "30DAYS"
                                    ? "bg-gray-100 font-semibold"
                                    : "bg-white"
                                }`}
                        >
                            Last 30 Days
                        </button>

                        <button
                            onClick={() => setPeriod("CUSTOM")}
                            className={`px-5 py-3 text-sm ${period === "CUSTOM"
                                    ? "bg-gray-100 font-semibold"
                                    : "bg-white"
                                }`}
                        >
                            Custom Date
                        </button>

                    </div>

                </div>

                {/* CUSTOM DATE */}
                {period === "CUSTOM" && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-5">

                        <div>
                            <label className="text-sm text-gray-500">
                                From
                            </label>

                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) =>
                                    setCustomStart(e.target.value)
                                }
                                className="block mt-1 border border-gray-300 rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-500">
                                To
                            </label>

                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) =>
                                    setCustomEnd(e.target.value)
                                }
                                className="block mt-1 border border-gray-300 rounded-lg p-2"
                            />
                        </div>

                    </div>
                )}

                {/* CHART HEADER */}
                <div className="mt-8 flex items-center justify-between">

                    <h3 className="text-xl font-bold text-gray-900">
                        {view === "ORDERS" ? "Orders" : "Sales"}
                    </h3>

                    <div className="flex border border-gray-200 rounded-lg overflow-hidden">

                        <button
                            onClick={() => setView("ORDERS")}
                            className={`px-5 py-2 text-sm ${view === "ORDERS"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                        >
                            Orders
                        </button>

                        <button
                            onClick={() => setView("SALES")}
                            className={`px-5 py-2 text-sm ${view === "SALES"
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                                }`}
                        >
                            Sales
                        </button>

                    </div>

                </div>

                {/* CHART */}
                <div className="mt-6 h-72 border border-gray-100 rounded-xl p-5">

                    <div className="h-full flex items-end gap-2 overflow-x-auto">

                        {chartData.map((item, index) => {
                            const value =
                                view === "ORDERS"
                                    ? item.orders
                                    : item.sales;

                            const height =
                                value === 0
                                    ? 4
                                    : Math.max(
                                        (value / maxValue) * 100,
                                        8
                                    );

                            return (
                                <div
                                    key={index}
                                    className="min-w-11.25 flex-1 h-full flex flex-col justify-end items-center"
                                >

                                    <div className="text-xs text-gray-500 mb-2">
                                        {view === "SALES"
                                            ? `₹${value.toFixed(0)}`
                                            : value}
                                    </div>

                                    <div
                                        className="w-full max-w-11.25 bg-gray-900 rounded-t-lg transition-all"
                                        style={{
                                            height: `${height}%`,
                                        }}
                                    />

                                    <div className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                                        {item.label}
                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 mt-6 border border-gray-200 rounded-xl overflow-hidden">

                    {/* ORDERS */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
                        <p className="text-sm text-gray-500">
                            Total Orders
                        </p>

                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {totalOrders}
                        </p>
                    </div>

                    {/* SALES */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
                        <p className="text-sm text-gray-500">
                            Total Sales
                        </p>

                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            ₹{totalSales.toFixed(2)}
                        </p>
                    </div>

                    {/* RETURN */}
                    <div className="p-6">
                        <p className="text-sm text-gray-500">
                            Return Percentage
                        </p>

                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            {returnPercentage.toFixed(1)}%
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Based on cancelled orders
                        </p>
                    </div>

                </div>

            </div>

            {/* PRODUCTS */}
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                <p className="text-sm text-gray-500">
                    Total Products
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {products.length}
                </p>

            </div>

        </main>
    );
}