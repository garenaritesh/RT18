"use client";

import { useEffect, useState } from "react";
import logo from "../assests/brand_new.png";

type User = {
    id: number;
    name: string;
    email: string;
};

export default function ContactPage() {
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        async function checkUser() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Auth check error:", error);
            } finally {
                setCheckingAuth(false);
            }
        }

        checkUser();
    }, []);

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            const data = await response.json();

            if (data.success) {
                setUser(null);
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    return (
        <main className="min-h-screen bg-white text-gray-900">

            {/* ================= NAVBAR ================= */}

            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">

                <div className="max-w-7xl mx-auto px-5 md:px-8">

                    <div className="h-20 flex items-center justify-between">

                        <a href="/" className="flex items-center">
                            <img
                                src={logo.src}
                                alt="RT18"
                                className="h-40 w-auto object-contain"
                            />
                        </a>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">

                            <a
                                href="/"
                                className="text-gray-500 hover:text-black transition"
                            >
                                Home
                            </a>

                            <a
                                href="/shop"
                                className="text-gray-500 hover:text-black transition"
                            >
                                Shop
                            </a>

                            <a
                                href="/#categories"
                                className="text-gray-500 hover:text-black transition"
                            >
                                Categories
                            </a>

                            <a
                                href="/about"
                                className="text-gray-500 hover:text-black transition"
                            >
                                About Us
                            </a>

                            <a
                                href="/contact"
                                className="text-black"
                            >
                                Contact Us
                            </a>

                        </div>

                        <div className="flex items-center gap-3">

                            <a
                                href="/cart"
                                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Cart 🛒
                            </a>

                            {!checkingAuth && (
                                <>
                                    {user ? (
                                        <div className="flex items-center gap-2">

                                            <a
                                                href="/account"
                                                className="hidden sm:block px-4 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold hover:bg-gray-200 transition"
                                            >
                                                Hi, {user.name}
                                            </a>

                                            <button
                                                onClick={logout}
                                                className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                                            >
                                                Logout
                                            </button>

                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">

                                            <a
                                                href="/login"
                                                className="hidden sm:block px-4 py-2.5 text-sm font-semibold hover:text-gray-500"
                                            >
                                                Login
                                            </a>

                                            <a
                                                href="/register"
                                                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                                            >
                                                Register
                                            </a>

                                        </div>
                                    )}
                                </>
                            )}

                        </div>

                    </div>

                </div>

            </nav>

            {/* ================= CONTACT ================= */}

            <section className="bg-[#f7f5f1] overflow-hidden">

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* LEFT */}

                        <div>

                            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                                Get In Touch
                            </p>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mt-4">
                                Contact
                                <br />
                                <span className="text-gray-400">
                                    RT18.
                                </span>
                            </h1>

                            <p className="text-gray-600 text-base md:text-lg max-w-lg mt-7 leading-relaxed">
                                Have a question about your order, product,
                                delivery or anything else? We are here to help.
                            </p>

                            <div className="mt-10 space-y-7">

                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                                        Email
                                    </p>

                                    <a
                                        href="mailto:YOUR_EMAIL@example.com"
                                        className="inline-block text-lg font-semibold mt-2 hover:text-gray-500 transition"
                                    >
                                        rtxviii18@gmail.com
                                    </a>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                                        Phone
                                    </p>

                                    <a
                                        href="tel:+919327500387"
                                        className="inline-block text-lg font-semibold mt-2 hover:text-gray-500 transition"
                                    >
                                        +91 93275 00387
                                    </a>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                                        Support Hours
                                    </p>

                                    <p className="text-lg font-semibold mt-2">
                                        Sunday – Saturday
                                    </p>

                                    <p className="text-gray-500 mt-1">
                                        10:00 AM – 8:00 PM
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* RIGHT IMAGE */}

                        <div className="relative">

                            <div className="absolute inset-0 border border-gray-300 rounded-[32px] rotate-3" />

                            <div className="relative h-[460px] md:h-[560px] rounded-[32px] overflow-hidden bg-black">

                                <img
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                                    alt="RT18 Customer Support"
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                <div className="absolute bottom-8 left-8 text-white">

                                    <p className="text-xs tracking-[0.3em] uppercase text-gray-300">
                                        RT18
                                    </p>

                                    <p className="text-2xl md:text-3xl font-black mt-2">
                                        We're here for you.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* ================= SUPPORT MESSAGE ================= */}

            <section className="py-16 md:py-20">

                <div className="max-w-7xl mx-auto px-5 md:px-8">

                    <div className="bg-black text-white rounded-3xl p-8 md:p-14 text-center">

                        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase">
                            Need Help?
                        </p>

                        <h2 className="text-3xl md:text-4xl font-black mt-3">
                            We're happy to assist you.
                        </h2>

                        <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
                            For order-related queries, please keep your
                            Order ID ready when contacting our support team.
                        </p>

                    </div>

                </div>

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="bg-black text-white">

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                        {/* BRAND */}

                        <div className="md:col-span-2">

                            <h2 className="text-3xl font-black">
                                RT18
                            </h2>

                            <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                                Discover your style with RT18.
                                Fashion, jewellery and accessories
                                curated for everyday confidence.
                            </p>

                        </div>

                        {/* SHOP */}

                        <div>

                            <h3 className="font-bold mb-4">
                                Shop
                            </h3>

                            <div className="space-y-3 text-sm text-gray-400">

                                <a
                                    href="/shop"
                                    className="block hover:text-white"
                                >
                                    All Products
                                </a>

                                <a
                                    href="/shop"
                                    className="block hover:text-white"
                                >
                                    Jewellery
                                </a>

                                <a
                                    href="/shop"
                                    className="block hover:text-white"
                                >
                                    Accessories
                                </a>

                            </div>

                        </div>

                        {/* ACCOUNT */}

                        <div>

                            <h3 className="font-bold mb-4">
                                Account
                            </h3>

                            <div className="space-y-3 text-sm text-gray-400">

                                <a
                                    href="/account"
                                    className="block hover:text-white"
                                >
                                    My Account
                                </a>

                                <a
                                    href="/account/orders"
                                    className="block hover:text-white"
                                >
                                    My Orders
                                </a>

                                <a
                                    href="/cart"
                                    className="block hover:text-white"
                                >
                                    Cart
                                </a>

                                <a
                                    href="/about"
                                    className="block hover:text-white"
                                >
                                    About Us
                                </a>

                                <a
                                    href="/contact"
                                    className="block hover:text-white"
                                >
                                    Contact Us
                                </a>

                                <a
                                    href="/shipping-return-policy"
                                    className="block hover:text-white"
                                >
                                    Shipping & Return Policy
                                </a>

                            </div>

                        </div>

                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-3 text-sm text-gray-500">

                        <p>
                            © {new Date().getFullYear()} RT18. All rights reserved.
                        </p>

                        <p>
                            Built with style.
                        </p>

                    </div>

                </div>

            </footer>

        </main>
    );
}