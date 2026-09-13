"use client";

import { useEffect, useState } from "react";
import logo from "../assests/brand_new.png";
import { getGuestCart } from "@/lib/guest-cart";
import { getSellingPrice } from "@/lib/pricing";

type User = {
    id: number;
    name: string;
    email: string;
};

type Product = {
    id: number;
    name: string;
    price: number;
    discount_price: number | null;
    image_url: string | null;
};

export default function ContactPage() {
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [cartCount, setCartCount] = useState(0);

    const searchResults = search.trim()
        ? products.filter((product) => product.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6)
        : [];

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

    useEffect(() => {
        fetch("/api/products")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch(() => setProducts([]));
    }, []);

    useEffect(() => {
        async function updateCartCount() {
            if (!user) {
                setCartCount(getGuestCart().reduce((total, item) => total + item.quantity, 0));
                return;
            }
            try {
                const response = await fetch("/api/cart");
                const data = await response.json();
                setCartCount((data.cart || []).reduce((total: number, item: { quantity?: number }) => total + Number(item.quantity || 0), 0));
            } catch {
                setCartCount(0);
            }
        }
        void updateCartCount();
    }, [user]);

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
            <div className="w-full overflow-hidden bg-black py-2.5 text-white">
                <div className="flex w-max animate-[announcement-slide_18s_linear_infinite] items-center gap-16 whitespace-nowrap text-xs font-semibold uppercase tracking-wide sm:text-sm">
                    <span>FREE SHIPPING ABOVE ₹500</span>
                    <span>PREPAID DISCOUNT ₹25 ON THE TOTAL CHECKOUT AMOUNT</span>
                    <span>FREE SHIPPING ABOVE ₹500</span>
                    <span>PREPAID DISCOUNT ₹25 ON THE TOTAL CHECKOUT AMOUNT</span>
                </div>
            </div>
            <style jsx>{`@keyframes announcement-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

            {/* ================= NAVBAR ================= */}

            <nav className="sticky top-0 z-9999 bg-white/95 backdrop-blur border-b border-gray-100">

                <div className="max-w-7xl mx-auto px-5 md:px-8">

                    <div className="h-20 flex items-center gap-3 md:gap-5">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition shrink-0" aria-label="Open menu">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
                        </button>
                        <a href="/" className="shrink-0 flex items-center"><img src={logo.src} alt="RT18" className="h-16 sm:h-16 md:h-20 w-auto object-contain" /></a>
                        <div className="hidden lg:flex items-center gap-6 text-sm font-medium shrink-0">
                            <a href="/" className="text-gray-500 hover:text-black transition">Home</a>
                            <a href="/shop" className="text-gray-500 hover:text-black transition">Shop</a>
                            <a href="/#categories" className="text-gray-500 hover:text-black transition">Categories</a>
                            <a href="/about" className="text-gray-500 hover:text-black transition">About Us</a>
                            <a href="/contact" className="text-black">Contact Us</a>
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setSearchOpen((value) => !value)} aria-label="Search products" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
                            </button>
                            {!checkingAuth && (user ? <div className="relative"><button onClick={() => setProfileOpen((value) => !value)} aria-label="Open profile menu" className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold hover:bg-gray-800 transition">{user.name.charAt(0).toUpperCase()}</button>{profileOpen && <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-120"><div className="px-3 py-3 border-b border-gray-100"><p className="font-semibold text-gray-900 truncate">{user.name}</p><p className="text-xs text-gray-500 truncate mt-1">{user.email}</p></div><a href="/account" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Account</a><a href="/account/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Orders</a><button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Logout</button></div>}</div> : <div className="hidden sm:flex items-center gap-2"><a href="/login" className="px-3 py-2.5 text-sm font-semibold hover:text-gray-500">Login</a><a href="/register" className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Register</a></div>)}
                            <a href="/cart" aria-label="Cart" className="relative w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>{cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{cartCount > 99 ? "99+" : cartCount}</span>}</a>
                        </div>

                    {searchOpen && <div className="pb-4"><div className="relative"><svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input autoFocus type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full bg-gray-50 border border-gray-300 rounded-full pl-12 pr-14 py-3 text-sm outline-none focus:border-gray-500 focus:bg-white transition" /><button onClick={() => { setSearch(""); setSearchOpen(false); }} aria-label="Close search" className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition">✕</button>{search.trim() && <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-120">{searchResults.length ? searchResults.map((product) => <a key={product.id} href={`/product/${product.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"><div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">{product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">RT18</div>}</div><div><p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p><p className="text-xs text-gray-500 mt-0.5">₹{getSellingPrice(product.price, product.discount_price).toFixed(0)}</p></div></a>) : <div className="p-5 text-sm text-gray-500 text-center">No products found.</div>}</div>}</div></div>}
                    </div>
                </div>
            </nav>

            {mobileMenuOpen && <>
                <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 z-9998 lg:hidden" />
                <aside className="fixed left-0 top-0 bottom-0 w-[82%] max-w-sm bg-white z-10000 shadow-2xl lg:hidden overflow-y-auto">
                    <div className="h-20 px-5 border-b border-gray-100 flex items-center justify-between"><a href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center"><img src={logo.src} alt="RT18" className="h-14 w-auto object-contain" /></a><button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition" aria-label="Close menu">✕</button></div>
                    <div className="p-4 space-y-2">
                        <a href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition">Home</a>
                        <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition">Shop</a>
                        <a href="/#categories" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition">Categories</a>
                        <a href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition">About Us</a>
                        <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl bg-gray-100 text-base font-semibold">Contact Us</a>
                        <a href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-4 rounded-xl text-base font-semibold hover:bg-gray-100 transition">Track Order</a>
                    </div>
                    <div className="border-t border-gray-100 p-5">{!checkingAuth && (user ? <><div className="mb-4"><p className="font-semibold text-gray-900">{user.name}</p><p className="text-xs text-gray-500 mt-1 break-all">{user.email}</p></div><a href="/account" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold mb-2">My Account</a><a href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold mb-2">My Orders</a><button onClick={() => { setMobileMenuOpen(false); void logout(); }} className="w-full text-left px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">Logout</button></> : <div className="flex gap-2"><a href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center border border-gray-200 py-3 rounded-xl text-sm font-semibold">Login</a><a href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-black text-white py-3 rounded-xl text-sm font-semibold">Register</a></div>)}</div>
                </aside>
            </>}

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

                            <div className="absolute inset-0 border border-gray-300 rounded-4xl rotate-3" />

                            <div className="relative h-115 md:h-140 rounded-4xl overflow-hidden bg-black">

                                <img
                                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85"
                                    alt="RT18 Customer Support"
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

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