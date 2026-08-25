"use client";

import { useEffect, useState } from "react";

type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string | null;
};

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadInventory() {
        try {
            const response = await fetch("/api/products");
            const data = await response.json();

            setProducts(data);
        } catch (error) {
            console.error("Inventory error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInventory();
    }, []);

    const totalProducts = products.length;

    const inStock = products.filter(
        (product) => Number(product.stock) > 5
    ).length;

    const lowStock = products.filter(
        (product) =>
            Number(product.stock) > 0 &&
            Number(product.stock) <= 5
    ).length;

    const outOfStock = products.filter(
        (product) => Number(product.stock) <= 0
    ).length;

    return (
        <main>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Inventory
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Monitor your product stock.
                    </p>
                </div>

                <button
                    onClick={loadInventory}
                    className="bg-black text-white px-5 py-3 rounded-xl"
                >
                    Refresh Inventory
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Products
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {totalProducts}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        In Stock
                    </p>

                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {inStock}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Low Stock
                    </p>

                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {lowStock}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Out of Stock
                    </p>

                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {outOfStock}
                    </p>
                </div>

            </div>

            {/* INVENTORY LIST */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Stock Overview
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Current stock of all products.
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading inventory...
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No products found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">

                        {products.map((product) => {
                            const stock = Number(product.stock);

                            let status = "In Stock";
                            let statusClass = "bg-green-100 text-green-700";

                            if (stock <= 0) {
                                status = "Out of Stock";
                                statusClass = "bg-red-100 text-red-700";
                            } else if (stock <= 5) {
                                status = "Low Stock";
                                statusClass = "bg-yellow-100 text-yellow-700";
                            }

                            return (
                                <div
                                    key={product.id}
                                    className="p-5 flex flex-col md:flex-row md:items-center gap-5 hover:bg-gray-50"
                                >

                                    {/* PRODUCT */}
                                    <div className="flex items-center gap-4 flex-1">

                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                                                📦
                                            </div>
                                        )}

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {product.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Product ID: #{product.id}
                                            </p>
                                        </div>

                                    </div>

                                    {/* PRICE */}
                                    <div className="w-32">
                                        <p className="text-xs text-gray-500">
                                            Price
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            ₹{Number(product.price).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* STOCK */}
                                    <div className="w-32">
                                        <p className="text-xs text-gray-500">
                                            Stock
                                        </p>

                                        <p className="font-bold text-gray-900 mt-1">
                                            {stock}
                                        </p>
                                    </div>

                                    {/* STATUS */}
                                    <div className="w-32">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                                        >
                                            {status}
                                        </span>
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