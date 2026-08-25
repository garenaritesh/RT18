"use client";

import { useEffect, useState } from "react";

type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string | null;
};

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(data));
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                All Products
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow overflow-hidden"
                    >
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-56 object-cover"
                            />
                        )}

                        <div className="p-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                {product.name}
                            </h2>

                            <p className="text-gray-900 mt-2">
                                ₹{product.price}
                            </p>

                            <p className="text-gray-600 mt-1">
                                Stock: {product.stock}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}