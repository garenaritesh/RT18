"use client";


import logo from "../assests/brand_new.png";
import { useEffect, useMemo, useState } from "react";
import { addToGuestCart, getGuestCart } from "@/lib/guest-cart";
import { getSellingPrice as calculateSellingPrice } from "@/lib/pricing";

type Product = {
    id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string | null;
    discount_price: number | null;
    category_name?: string | null;
};

type Category = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
};

type CartItem = Product & {
    quantity: number;
    user_id: number;
};

function sortOutOfStockLast(products: Product[]) {
    return [...products].sort(
        (a, b) => Number(Number(a.stock) <= 0) - Number(Number(b.stock) <= 0)
    );
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("newest");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // =========================
    // LOAD CURRENT USER
    // =========================

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (data.success && data.user?.id) {
                    setCurrentUser(data.user);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("User loading error:", error);
                setCurrentUser(null);
            } finally {
                setCheckingAuth(false);
            }
        }

        loadCurrentUser();
    }, []);

    async function logout() {
        try {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            const data = await response.json();
            if (data.success) {
                setCurrentUser(null);
                setProfileOpen(false);
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    // =========================
    // LOAD PRODUCTS
    // =========================

    useEffect(() => {
        async function loadProducts() {
            try {
                const response = await fetch("/api/products");
                const data = await response.json();

                setProducts(data);
            } catch (error) {
                console.error("Products loading error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    // =========================
    // LOAD CATEGORIES
    // =========================

    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await fetch("/api/categories");
                const data = await response.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error("Categories loading error:", error);
            } finally {
                setLoadingCategories(false);
            }
        }

        loadCategories();
    }, []);

    // =========================
    // CART COUNT
    // =========================

    useEffect(() => {
        async function updateCartCount() {
            if (!currentUser?.id) {
                setCartCount(
                    getGuestCart().reduce((sum, item) => sum + item.quantity, 0)
                );
                return;
            }

            try {
                const response = await fetch("/api/cart");
                const data = await response.json();
                setCartCount(
                    (data.cart || []).reduce(
                        (sum: number, item: { quantity?: number }) => sum + Number(item.quantity || 0),
                        0
                    )
                );
            } catch {
                setCartCount(0);
            }
        }

        updateCartCount();

        window.addEventListener("cartUpdated", updateCartCount);

        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
        };
    }, [currentUser]);

    // =========================
    // SHOP CATEGORIES
    // =========================

    const shopCategories = useMemo(() => {
        return [
            "All",
            ...categories.map((category) => category.name),
        ];
    }, [categories]);

    // =========================
    // SELLING PRICE
    // =========================

    function getSellingPrice(product: Product) {
        return calculateSellingPrice(product.price, product.discount_price);
    }

    // =========================
    // FILTER + SORT
    // =========================

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // SEARCH

        if (search.trim()) {
            result = result.filter((product) =>
                product.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        // CATEGORY

        if (category !== "All") {
            result = result.filter(
                (product) =>
                    product.category_name === category
            );
        }

        // PRICE LOW → HIGH

        if (sort === "price-low") {
            result.sort(
                (a, b) =>
                    getSellingPrice(a) -
                    getSellingPrice(b)
            );
        }

        // PRICE HIGH → LOW

        if (sort === "price-high") {
            result.sort(
                (a, b) =>
                    getSellingPrice(b) -
                    getSellingPrice(a)
            );
        }

        // BIGGEST DISCOUNT

        if (sort === "discount") {
            result.sort(
                (a, b) =>
                    Number(b.discount_price || 0) -
                    Number(a.discount_price || 0)
            );
        }

        // Keep out-of-stock products last without changing the selected sort.
        result = sortOutOfStockLast(result);

        return result;
    }, [products, search, category, sort]);

    // =========================
    // ADD TO CART
    // =========================

    async function addToCart(product: Product) {
        if (!currentUser?.id) {
            if (product.stock <= 0) {
                alert("This product is out of stock");
                return;
            }

            addToGuestCart(product.id, 1);
            alert("Added to cart!");
            return;
        }

        if (product.stock <= 0) {
            alert("This product is out of stock");
            return;
        }

        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                alert(data.message || "Failed to add product to cart");
                return;
            }
            window.dispatchEvent(new Event("cartUpdated"));
            alert("Added to cart!");
        } catch {
            alert("Failed to add product to cart");
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">

            {/* ================= NAVBAR ================= */}
            <nav className="sticky top-0 z-9999 bg-white/95 backdrop-blur border-b border-gray-100 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
                    <div className="h-20 flex items-center gap-3 md:gap-5">

                        {/* MOBILE MENU BUTTON */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((value) => !value)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileMenuOpen}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition shrink-0"
                        >
                            <span className="text-xl leading-none">{mobileMenuOpen ? "×" : "☰"}</span>
                        </button>

                        {/* LOGO */}
                        <a href="/" className="shrink-0 flex items-center">
                            <img
                                src={logo.src}
                                alt="RT18"
                                className="h-16 sm:h-16 md:h-20 w-auto object-contain"
                            />
                        </a>

                        {/* DESKTOP NAV LINKS */}
                        <div className="hidden lg:flex items-center gap-6 text-sm font-medium shrink-0">
                            <a href="/" className="text-gray-900 hover:text-gray-500 transition">Home</a>
                            <a href="/shop" className="text-gray-500 hover:text-gray-900 transition">Shop</a>
                            <a href="/#categories" className="text-gray-500 hover:text-gray-900 transition">Categories</a>
                            <a href="/about" className="text-gray-500 hover:text-gray-900 transition">About Us</a>
                        </div>

                        <div className="flex-1" />

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 shrink-0">

                            {/* SEARCH */}
                            <button
                                type="button"
                                onClick={() => setSearchOpen((v) => !v)}
                                aria-label="Search products"
                                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition"
                            >
                                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>
                            </button>

                            {/* PROFILE */}
                            {!checkingAuth && (currentUser ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen((value) => !value)}
                                        aria-label="Open profile menu"
                                        className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold hover:bg-gray-800 transition"
                                    >
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </button>
                                    {profileOpen && (
                                        <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-120">
                                            <div className="px-3 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900 truncate">{currentUser.name}</p>
                                                <p className="text-xs text-gray-500 truncate mt-1">{currentUser.email}</p>
                                            </div>
                                            <a href="/account" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Account</a>
                                            <a href="/account/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Orders</a>
                                            <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <a href="/login" className="px-3 py-2.5 text-sm font-semibold hover:text-gray-500">Login</a>
                                    <a href="/register" className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Register</a>
                                </div>
                            ))}

                            {/* CART */}
                            <a
                                href="/cart"
                                aria-label="Cart"
                                className="relative w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 8h12l-1 12H7L6 8Z" />
                                    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </a>

                           
                        </div>
                    </div>

                    {/* SEARCH PANEL */}
                    {searchOpen && (
                        <div className="border-t border-gray-100 py-3">
                            <div className="relative max-w-3xl mx-auto">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>
                                <input
                                    autoFocus
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-12 pr-5 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* MOBILE MENU */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-gray-100 py-3 bg-white relative z-110">
                            <div className="flex flex-col gap-1 text-sm font-semibold">
                                <a href="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">Home</a>
                                <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl bg-gray-50">Shop</a>
                                <a href="/#categories" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">Categories</a>
                                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">About Us</a>
                                <a href="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-gray-50">My Account</a>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ================= SHOP HEADER ================= */}

            {/* ================= SHOP HEADER ================= */}

            <section className="hidden md:block bg-black text-white">
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">

                    <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-semibold">
                        RT18 Collection
                    </p>

                    <h1 className="text-4xl md:text-6xl font-black mt-3">
                        Shop All Products
                    </h1>

                    <p className="text-gray-400 max-w-xl mt-4 leading-relaxed">
                        Explore our latest collection of jewellery,
                        accessories and fashion pieces.
                    </p>

                </div>
            </section>      {/* ================= FILTER BAR ================= */}

            <section className="bg-white border-b border-gray-200 sticky top-20 z-40">

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">

                    <div className="flex flex-col lg:flex-row gap-4 justify-between">

                        {/* SEARCH */}

                        <div className="relative flex-1 max-w-xl">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-black transition text-gray-900"
                            />

                        </div>

                        {/* SORT */}

                        <div className="flex gap-3">

                            <select
                                value={sort}
                                onChange={(e) =>
                                    setSort(e.target.value)
                                }
                                className="border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black"
                            >
                                <option value="newest">
                                    Newest
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="discount">
                                    Biggest Discount
                                </option>
                            </select>

                        </div>

                    </div>

                    {/* CATEGORIES */}

                    <div className="flex gap-2 overflow-x-auto mt-5 pb-1">

                        {loadingCategories ? (

                            <span className="text-sm text-gray-400 py-2">
                                Loading categories...
                            </span>

                        ) : (

                            shopCategories.map((item) => (

                                <button
                                    key={item}
                                    onClick={() =>
                                        setCategory(item)
                                    }
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition ${category === item
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    {item}
                                </button>

                            ))

                        )}

                    </div>

                </div>

            </section>

            {/* ================= PRODUCTS ================= */}

            <section className="max-w-7xl mx-auto px-5 md:px-8 py-12">

                {/* RESULT COUNT */}

                {!loading && (
                    <div className="flex items-center justify-between mb-7">

                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredProducts.length}
                            </span>{" "}
                            products
                        </p>

                        {(search || category !== "All") && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setCategory("All");
                                }}
                                className="text-sm font-semibold hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>
                )}

                {/* LOADING */}

                {loading && (

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
                                >

                                    <div className="h-56 md:h-72 bg-gray-200" />

                                    <div className="p-5 space-y-3">

                                        <div className="h-4 bg-gray-200 rounded w-3/4" />

                                        <div className="h-4 bg-gray-200 rounded w-1/2" />

                                        <div className="h-10 bg-gray-200 rounded-xl" />

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

                {/* EMPTY */}

                {!loading &&
                    filteredProducts.length === 0 && (

                        <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center">

                            <div className="text-5xl">
                                🔍
                            </div>

                            <h2 className="text-xl font-bold mt-5">
                                No products found
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Try another search or category.
                            </p>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setCategory("All");
                                }}
                                className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold"
                            >
                                View All Products
                            </button>

                        </div>
                    )}

                {/* PRODUCT GRID */}

                {!loading &&
                    filteredProducts.length > 0 && (

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

                            {filteredProducts.map((product) => {

                                const sellingPrice =
                                    getSellingPrice(product);

                                const discount =
                                    Number(
                                        product.discount_price || 0
                                    );

                                const hasDiscount =
                                    discount > 0 &&
                                    discount < Number(product.price);

                                const discountPercent =
                                    hasDiscount
                                        ? Math.round(
                                            (discount /
                                                Number(product.price)) *
                                            100
                                        )
                                        : 0;

                                return (

                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >

                                        {/* IMAGE */}

                                        <a
                                            href={`/product/${product.id}`}
                                            className="relative block h-56 md:h-72 bg-gray-100 overflow-hidden"
                                        >

                                            {product.image_url ? (

                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />

                                            ) : (

                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-black">
                                                    RT18
                                                </div>

                                            )}

                                            {/* DISCOUNT */}

                                            {hasDiscount && (
                                                <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                                                    {discountPercent}% OFF
                                                </span>
                                            )}

                                            {/* STOCK */}

                                            {product.stock <= 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">
                                                        OUT OF STOCK
                                                    </span>
                                                </div>
                                            )}

                                        </a>

                                        {/* DETAILS */}

                                        <div className="p-4 md:p-5">

                                            {product.category_name && (
                                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                                    {product.category_name}
                                                </p>
                                            )}

                                            <h2 className="font-bold text-gray-900 mt-1 line-clamp-2 min-h-12">
                                                {product.name}
                                            </h2>

                                            {/* PRICE */}

                                            <div className="flex items-center gap-2 flex-wrap mt-3">

                                                <span className="text-lg font-black text-gray-900">
                                                    ₹{sellingPrice.toFixed(0)}
                                                </span>

                                                {hasDiscount && (
                                                    <>
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ₹
                                                            {Number(
                                                                product.price
                                                            ).toFixed(0)}
                                                        </span>

                                                        <span className="text-xs font-bold text-green-600">
                                                            ₹{discount} OFF
                                                        </span>
                                                    </>
                                                )}

                                            </div>

                                            {/* STOCK INFO */}

                                            <p className="text-xs mt-2">

                                                {product.stock <= 0 ? (

                                                    <span className="text-red-500 font-semibold">
                                                        Currently unavailable
                                                    </span>

                                                ) : product.stock <= 5 ? (

                                                    <span className="text-orange-600 font-semibold">
                                                        Only {product.stock} left
                                                    </span>

                                                ) : (

                                                    <span className="text-gray-400">
                                                        In stock
                                                    </span>

                                                )}

                                            </p>

                                            {/* BUTTON */}

                                            <button
                                                onClick={() =>
                                                    addToCart(product)
                                                }
                                                disabled={product.stock <= 0}
                                                className="w-full mt-4 bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                {product.stock > 0
                                                    ? "Add to Cart"
                                                    : "Out of Stock"}
                                            </button>

                                        </div>

                                    </div>

                                );
                            })}

                        </div>
                    )}

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="bg-black text-white mt-10">

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">

                    <div className="flex flex-col md:flex-row justify-between gap-8">

                        <div>

                            <h2 className="text-3xl font-black">
                                RT18
                            </h2>

                            <p className="text-gray-400 mt-3 max-w-md text-sm leading-relaxed">
                                Discover your style with RT18.
                                Fashion, jewellery and accessories
                                curated for everyday confidence.
                            </p>

                        </div>

                        <div className="flex gap-10 text-sm text-gray-400">

                            <div className="space-y-3">

                                <p className="text-white font-semibold">
                                    Shop
                                </p>

                                <a
                                    href="/shop"
                                    className="block hover:text-white"
                                >
                                    All Products
                                </a>

                                <a
                                    href="/cart"
                                    className="block hover:text-white"
                                >
                                    Cart
                                </a>

                            </div>

                            <div className="space-y-3">

                                <p className="text-white font-semibold">
                                    Account
                                </p>

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

                            </div>

                        </div>

                    </div>

                    <div className="border-t border-gray-800 mt-10 pt-5 text-sm text-gray-500">
                        © {new Date().getFullYear()} RT18. All rights reserved.
                    </div>

                </div>

            </footer>

        </main>
    );
}