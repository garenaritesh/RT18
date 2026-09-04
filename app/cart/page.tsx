"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import logo from "../assests/brand_new.png";

type User = {
    id: number;
    name: string;
    email: string;
};

type CartItem = {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
    user_id: number;
};

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();
                setUser(data.success ? data.user : null);
            } catch (error) {
                console.error("Auth check error:", error);
                setUser(null);
            } finally {
                setCheckingAuth(false);
            }
        }

        loadUser();
    }, []);

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            const data = await response.json();
            if (data.success) {
                setUser(null);
                setProfileOpen(false);
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    useEffect(() => {
        async function loadUserCart() {
            try {
                const response = await fetch("/api/cart");
                const data = await response.json();

                if (!response.ok || !data.success) {
                    setCart([]);
                    return;
                }

                setCart(data.cart || []);
            } catch (error) {
                console.error("Cart loading error:", error);
                setCart([]);
            }
        }

        loadUserCart();
    }, []);

    async function updateCart(updatedCart: CartItem[]) {
        setCart(updatedCart);

        try {
            await Promise.all(
                updatedCart.map((item) =>
                    fetch("/api/cart", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            productId: item.id,
                            quantity: item.quantity,
                        }),
                    })
                )
            );

            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Cart update error:", error);
        }
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
        const currentItem = cart.find((item) => item.id === id);

        if (currentItem?.quantity === 1) {
            removeItem(id);
            return;
        }

        const updatedCart = cart
            .map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                    }
                    : item
            );

        setCart(updatedCart);

        fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
        })
            .then(() => window.dispatchEvent(new Event("cartUpdated")))
            .catch((error) => console.error("Cart removal error:", error));
    }

    function removeItem(id: number) {
        const updatedCart = cart.filter(
            (item) => item.id !== id
        );

        updateCart(updatedCart);
    }

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price) * item.quantity,
        0
    );

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">

            {/* ================= NAVBAR ================= */}

            <nav className="sticky top-0 z-9999 bg-white/95 backdrop-blur border-b border-gray-100 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
                    <div className="h-20 flex items-center gap-3 md:gap-5">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((value) => !value)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileMenuOpen}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition shrink-0"
                        >
                            <span className="text-xl leading-none">{mobileMenuOpen ? "×" : "☰"}</span>
                        </button>

                        <Link href="/" className="shrink-0 flex items-center">
                            <img src={logo.src} alt="RT18" className="h-16 sm:h-16 md:h-20 w-auto object-contain" />
                        </Link>

                        <div className="hidden lg:flex items-center gap-6 text-sm font-medium shrink-0">
                            <Link href="/" className="text-gray-500 hover:text-black transition">Home</Link>
                            <Link href="/shop" className="text-gray-500 hover:text-black transition">Shop</Link>
                            <Link href="/#categories" className="text-gray-500 hover:text-black transition">Categories</Link>
                            <Link href="/about" className="text-gray-500 hover:text-black transition">About Us</Link>
                        </div>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setSearchOpen((value) => !value)}
                                aria-label="Search products"
                                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
                                </svg>
                            </button>

                            {!checkingAuth && (user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen((value) => !value)}
                                        aria-label="Open profile menu"
                                        className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold hover:bg-gray-800 transition"
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </button>
                                    {profileOpen && (
                                        <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-120">
                                            <div className="px-3 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                                            </div>
                                            <Link href="/account" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Account</Link>
                                            <Link href="/account/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Orders</Link>
                                            <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link href="/login" className="px-3 py-2.5 text-sm font-semibold hover:text-gray-500">Login</Link>
                                    <Link href="/register" className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Register</Link>
                                </div>
                            ))}

                            <Link href="/cart" aria-label="Cart" className="relative w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" />
                                </svg>
                                {totalItems > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{totalItems > 99 ? "99+" : totalItems}</span>}
                            </Link>
                        </div>
                    </div>

                    {searchOpen && (
                        <div className="border-t border-gray-100 py-3">
                            <input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white transition" />
                        </div>
                    )}

                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-gray-100 py-3 bg-white relative z-110">
                            <div className="flex flex-col gap-1 text-sm font-semibold">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">Home</Link>
                                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">Shop</Link>
                                <Link href="/#categories" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">Categories</Link>
                                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">About Us</Link>
                                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">My Account</Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

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

                                            <p className="text-gray-500 text-sm mt-2">
                                                ₹
                                                {Number(item.price).toFixed(
                                                    0
                                                )}{" "}
                                                per item
                                            </p>

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
                                                            Number(item.price) *
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