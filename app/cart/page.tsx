"use client";

import logo from "../assests/brand_new.png";
import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    discount_price?: number | null;
    image_url: string | null;
    quantity: number;
};

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        setCart(savedCart);
    }, []);

    function updateCart(updatedCart: CartItem[]) {
        setCart(updatedCart);

        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );

        window.dispatchEvent(new Event("cartUpdated"));
    }

    function increaseQuantity(id: number) {
        const updatedCart = cart.map((item) =>
            item.id === id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                }
                : item
        );

        updateCart(updatedCart);
    }

    function decreaseQuantity(id: number) {
        const updatedCart = cart
            .map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                    }
                    : item
            )
            .filter((item) => item.quantity > 0);

        updateCart(updatedCart);
    }

    function removeItem(id: number) {
        const updatedCart = cart.filter(
            (item) => item.id !== id
        );

        updateCart(updatedCart);
    }

    const total = cart.reduce(
        (sum, item) =>
            sum + Number(item.price) * item.quantity,
        0
    );

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">

            {/* ================= CART HEADER ================= */}

            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-5 md:px-8">
                    <div className="h-20 md:h-24 flex items-center justify-between">

                        {/* LOGO */}

                        <a
                            href="/"
                            className="shrink-0 flex items-center"
                        >
                            <img
                                src={logo.src}
                                alt="RT18"
                                className="h-40 sm:h-40 md:h-40 w-auto object-contain"
                            />
                        </a>
                        {/* BACK TO SHOPPING */}

                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-white text-sm md:text-base font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition"
                        >
                            <span className="text-lg">←</span>
                            <span className="hidden sm:inline">
                                Continue Shopping
                            </span>
                            <span className="sm:hidden">
                                Shopping
                            </span>
                        </Link>

                    </div>
                </div>
            </header>

            {/* ================= CONTENT ================= */}

            <section className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">

                {/* HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">

                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">
                            RT18 Shopping
                        </p>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-2">
                            Your Cart
                        </h1>
                    </div>

                    {cart.length > 0 && (
                        <p className="text-gray-500">
                            {totalItems}{" "}
                            {totalItems === 1
                                ? "item"
                                : "items"}
                        </p>
                    )}

                </div>

                {/* ================= EMPTY CART ================= */}

                {cart.length === 0 ? (

                    <div className="bg-white border border-gray-100 rounded-3xl p-10 md:p-16 text-center shadow-sm">

                        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                            🛒
                        </div>

                        <h2 className="text-2xl font-bold mt-6">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Looks like you haven't added
                            anything to your cart yet.
                        </p>

                        <Link
                            href="/shop"
                            className="inline-block mt-7 bg-black text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition"
                        >
                            Start Shopping
                        </Link>

                    </div>

                ) : (

                    /* ================= CART ================= */

                    <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

                        {/* PRODUCTS */}

                        <div className="space-y-4">

                            {cart.map((item) => (

                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm"
                                >

                                    <div className="flex gap-4 md:gap-5">

                                        {/* IMAGE */}

                                        <Link
                                            href={`/product/${item.id}`}
                                            className="shrink-0"
                                        >

                                            {item.image_url ? (

                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-xl"
                                                />

                                            ) : (

                                                <div className="w-28 h-28 md:w-36 md:h-36 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold">
                                                    RT18
                                                </div>

                                            )}

                                        </Link>

                                        {/* DETAILS */}

                                        <div className="flex-1 min-w-0 flex flex-col">

                                            <div className="flex justify-between gap-3">

                                                <Link
                                                    href={`/product/${item.id}`}
                                                    className="font-bold text-lg leading-snug hover:underline line-clamp-2"
                                                >
                                                    {item.name}
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="text-gray-400 hover:text-red-600 transition text-xl shrink-0"
                                                    title="Remove item"
                                                >
                                                    ×
                                                </button>

                                            </div>

                                            {/* PRICE */}

                                            <div className="mt-2">

                                                {item.original_price &&
                                                    item.original_price > item.price && (
                                                        <span className="text-gray-400 text-sm line-through mr-2">
                                                            ₹
                                                            {Number(
                                                                item.original_price
                                                            ).toFixed(0)}
                                                        </span>
                                                    )}

                                                <span className="text-gray-700 text-sm font-semibold">
                                                    ₹
                                                    {Number(
                                                        item.price
                                                    ).toFixed(0)}
                                                </span>

                                                <span className="text-gray-500 text-sm ml-1">
                                                    per item
                                                </span>

                                            </div>

                                            {/* BOTTOM */}

                                            <div className="mt-auto pt-5 flex items-end justify-between gap-3">

                                                {/* QUANTITY */}

                                                <div>

                                                    <p className="text-xs text-gray-400 font-semibold mb-2">
                                                        Quantity
                                                    </p>

                                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">

                                                        <button
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    item.id
                                                                )
                                                            }
                                                            className="w-9 h-9 md:w-10 md:h-10 hover:bg-gray-100 transition font-semibold"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="w-9 md:w-10 text-center font-bold">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    item.id
                                                                )
                                                            }
                                                            className="w-9 h-9 md:w-10 md:h-10 hover:bg-gray-100 transition font-semibold"
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                </div>

                                                {/* ITEM TOTAL */}

                                                <div className="text-right">

                                                    <p className="text-xs text-gray-400 font-semibold mb-1">
                                                        Subtotal
                                                    </p>

                                                    <p className="text-xl font-black">
                                                        ₹
                                                        {(
                                                            Number(
                                                                item.price
                                                            ) *
                                                            item.quantity
                                                        ).toFixed(0)}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ))}

                            {/* CONTINUE SHOPPING */}

                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition pt-2"
                            >
                                ← Continue Shopping
                            </Link>

                        </div>

                        {/* ================= ORDER SUMMARY ================= */}

                        <div className="lg:sticky lg:top-28">

                            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-7 shadow-sm">

                                <h2 className="text-xl font-black">
                                    Order Summary
                                </h2>

                                <div className="border-t border-gray-100 my-6" />

                                <div className="space-y-4">

                                    <div className="flex justify-between text-gray-600">

                                        <span>
                                            Subtotal
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            ₹{total.toFixed(0)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between text-gray-600">

                                        <span>
                                            Delivery
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            Calculated at checkout
                                        </span>

                                    </div>

                                </div>

                                <div className="border-t border-gray-100 my-6" />

                                <div className="flex items-center justify-between">

                                    <span className="text-lg font-bold">
                                        Total
                                    </span>

                                    <span className="text-2xl font-black">
                                        ₹{total.toFixed(0)}
                                    </span>

                                </div>

                                <Link
                                    href="/checkout"
                                    className="block text-center w-full bg-black text-white py-4 rounded-xl mt-6 font-bold hover:bg-gray-800 transition"
                                >
                                    Proceed to Checkout
                                </Link>

                                <div className="mt-5 space-y-3">

                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="text-lg">
                                            🔒
                                        </span>
                                        Secure checkout
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="text-lg">
                                            🚚
                                        </span>
                                        Reliable delivery
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="text-lg">
                                            ✓
                                        </span>
                                        Quality products
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="bg-black text-white mt-10">

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

                    <div className="flex flex-col md:flex-row justify-between gap-6">

                        <div>

                            <h2 className="text-2xl font-black">
                                RT18
                            </h2>

                            <p className="text-gray-500 text-sm mt-2">
                                Discover your style with RT18.
                            </p>

                        </div>

                        <div className="flex gap-8 text-sm text-gray-400">

                            <Link
                                href="/shop"
                                className="hover:text-white transition"
                            >
                                Shop
                            </Link>

                            <Link
                                href="/account"
                                className="hover:text-white transition"
                            >
                                Account
                            </Link>

                        </div>

                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-5 text-sm text-gray-600">
                        © {new Date().getFullYear()} RT18. All rights reserved.
                    </div>

                </div>

            </footer>

        </main>
    );
}