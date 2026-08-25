"use client";

import { useEffect, useState } from "react";

type Order = {
    id: number;
    order_status: string;
    total_amount: number;
};

type Product = {
    id: number;
    name: string;
    stock: number;
};

export default function AdminPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [ordersResponse, productsResponse] = await Promise.all([
                    fetch("/api/orders"),
                    fetch("/api/products"),
                ]);

                const ordersData = await ordersResponse.json();
                const productsData = await productsResponse.json();

                setOrders(ordersData);
                setProducts(productsData);
            } catch (error) {
                console.error("Dashboard loading error:", error);
            }
        }

        loadDashboard();
    }, []);

    const pendingOrders = orders.filter(
        (order) => order.order_status === "PLACED"
    ).length;

    const shippedOrders = orders.filter(
        (order) => order.order_status === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.order_status === "DELIVERED"
    ).length;

    const outOfStock = products.filter(
        (product) => Number(product.stock) <= 0
    ).length;

    const totalOrders = orders.length;

    return (
        <main>
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, RT18 👋
                </h1>

                <p className="text-gray-500 mt-1">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Pending */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Pending Orders
                            </p>

                            <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                {pendingOrders}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">
                            📦
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Orders waiting for confirmation
                    </p>
                </div>

                {/* Shipped */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Shipped Orders
                            </p>

                            <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                {shippedOrders}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                            🚚
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Orders currently in shipping
                    </p>
                </div>

                {/* Delivered */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Delivered Orders
                            </p>

                            <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                {deliveredOrders}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Successfully delivered orders
                    </p>
                </div>

                {/* Out of Stock */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Out of Stock
                            </p>

                            <h2 className="text-3xl font-bold text-gray-900 mt-2">
                                {outOfStock}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                            ⚠️
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Products that need restocking
                    </p>
                </div>
            </div>

            {/* SECOND SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                {/* Orders Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Orders Overview
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Current order activity
                            </p>
                        </div>

                        <a
                            href="/admin/orders"
                            className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                            View Orders →
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-4">

                        <div className="bg-gray-50 rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                                Total Orders
                            </p>

                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {totalOrders}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                                Shipped
                            </p>

                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {shippedOrders}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                                Delivered
                            </p>

                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {deliveredOrders}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Inventory Alert */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Inventory Alert
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Products that need attention
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                            📦
                        </div>

                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {outOfStock}
                            </p>

                            <p className="text-sm text-gray-500">
                                Out of stock products
                            </p>
                        </div>
                    </div>

                    <a
                        href="/admin/inventory"
                        className="block text-center mt-6 bg-black text-white py-3 rounded-xl hover:bg-gray-800"
                    >
                        Manage Inventory
                    </a>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

                    <a
                        href="/admin/products"
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition"
                    >
                        <p className="text-2xl">🛍️</p>

                        <h3 className="font-bold text-gray-900 mt-3">
                            Add Product
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Add a new product to your store
                        </p>
                    </a>

                    <a
                        href="/admin/orders"
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition"
                    >
                        <p className="text-2xl">📦</p>

                        <h3 className="font-bold text-gray-900 mt-3">
                            Manage Orders
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            View and update customer orders
                        </p>
                    </a>

                    <a
                        href="/admin/inventory"
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition"
                    >
                        <p className="text-2xl">📋</p>

                        <h3 className="font-bold text-gray-900 mt-3">
                            Check Inventory
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage product stock
                        </p>
                    </a>

                </div>
            </div>
        </main>
    );
}