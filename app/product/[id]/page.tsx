"use client";

import logo from "../../assests/brand_new.png";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
    id: number;
    name: string;
    price: number;
    discount_price: number | null;
    stock: number;
    image_url: string | null;
    category_name: string | null;
};

type User = {
    id: number;
    name: string;
    email: string;
};

type ProductImage = {
    id: number;
    image_url: string;
};

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // NAVBAR STATE
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const searchResults = search.trim()
        ? products
            .filter((item) =>
                `${item.name} ${item.category_name || ""}`
                    .toLowerCase()
                    .includes(search.trim().toLowerCase())
            )
            .slice(0, 6)
        : [];

    useEffect(() => {
        async function checkUser() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();
                if (data.success) setUser(data.user);
            } catch (error) {
                console.error("Auth check error:", error);
            } finally {
                setCheckingAuth(false);
            }
        }
        checkUser();
    }, []);

    useEffect(() => {
        async function loadProducts() {
            try {
                const response = await fetch("/api/products");
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : data.products || []);
            } catch (error) {
                console.error("Products loading error:", error);
            }
        }
        loadProducts();
    }, []);

    useEffect(() => {
        async function updateCartCount() {
            if (!user?.id) {
                setCartCount(0);
                return;
            }

            try {
                const response = await fetch("/api/cart");
                const data = await response.json();
                setCartCount(
                    (data.cart || []).reduce(
                        (total: number, item: { quantity?: number }) => total + Number(item.quantity || 0),
                        0
                    )
                );
            } catch {
                setCartCount(0);
            }
        }

        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);
        return () => window.removeEventListener("cartUpdated", updateCartCount);
    }, [user]);

    async function logout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setProfileOpen(false);
            setMobileMenuOpen(false);
            router.push("/");
        }
    }

    useEffect(() => {
        async function loadProduct() {
            try {
                const response = await fetch(
                    `/api/products/${params.id}`
                );

                const data = await response.json();

                if (data.success) {
                    setProduct(data.product);

                    setImages(data.images || []);

                    setSelectedImage(
                        data.product.image_url ||
                        data.images?.[0]?.image_url ||
                        null
                    );
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Product loading error:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            loadProduct();
        }
    }, [params.id]);

    function getSellingPrice() {
        if (!product) return 0;

        return (
            Number(product.price) -
            Number(product.discount_price || 0)
        );
    }

    async function addProductToCart() {
        if (!product) return;

        if (product.stock <= 0) {
            alert("This product is out of stock");
            return;
        }

        if (quantity > product.stock) {
            alert("Maximum available stock reached");
            return;
        }

        if (!user?.id) {
            alert("Please login to add products to your cart");
            router.push("/login");
            return false;
        }

        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                alert(data.message || "Failed to add product to cart");
                return false;
            }
            window.dispatchEvent(new Event("cartUpdated"));
            return true;
        } catch {
            alert("Failed to add product to cart");
            return false;
        }
    }

    async function addToCart() {
        if (await addProductToCart()) {
            alert("Product added to cart!");
        }
    }

    async function buyNow() {
        if (!product) return;

        if (product.stock <= 0) {
            alert("This product is out of stock");
            return;
        }

        if (quantity > product.stock) {
            alert("Maximum available stock reached");
            return;
        }

        if (await addProductToCart()) {
            router.push("/checkout");
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">

                <nav className="h-20 bg-white border-b border-gray-100 flex items-center px-5 md:px-8">
                    <div className="max-w-7xl w-full mx-auto">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
                    <div className="grid md:grid-cols-2 gap-10">

                        <div className="h-125 bg-gray-200 rounded-3xl animate-pulse" />

                        <div className="space-y-5">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
                            <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-14 w-full bg-gray-200 rounded animate-pulse" />
                        </div>

                    </div>
                </div>

            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md">

                    <div className="text-5xl">😕</div>

                    <h1 className="text-2xl font-bold mt-5">
                        Product Not Found
                    </h1>

                    <p className="text-gray-500 mt-2">
                        This product may have been removed or
                        doesn't exist.
                    </p>

                    <button
                        onClick={() => router.push("/shop")}
                        className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Back to Shop
                    </button>

                </div>

            </main>
        );
    }

    const sellingPrice = getSellingPrice();

    const discount = Number(
        product.discount_price || 0
    );

    const hasDiscount =
        discount > 0 &&
        discount < Number(product.price);

    const discountPercent = hasDiscount
        ? Math.round(
            (discount / Number(product.price)) * 100
        )
        : 0;

    // Main image + additional images
    const galleryImages = [
        ...(product.image_url
            ? [
                {
                    id: 0,
                    image_url: product.image_url,
                },
            ]
            : []),
        ...images.filter(
            (image) =>
                image.image_url !== product.image_url
        ),
    ];

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-5000 bg-white/95 backdrop-blur border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8">
                    {/* MAIN HEADER */}
                    <div className="h-20 flex items-center gap-3 md:gap-5">

                        {/* LOGO */}
                        <a href="/" className="shrink-0 flex items-center">
                            <img
                                src={logo.src}
                                alt="RT18"
                                className="h-40 sm:h-40 md:h-40 w-auto object-contain"
                            />
                        </a>

                        {/* DESKTOP LINKS */}
                        <div className="hidden lg:flex items-center gap-7 text-sm font-medium">
                            <a href="/" className="text-black hover:text-gray-500 transition">Home</a>
                            <a href="/shop" className="text-gray-500 hover:text-black transition">Shop</a>
                            <a href="/#categories" className="text-gray-500 hover:text-black transition">Categories</a>
                            <a href="/about" className="text-gray-500 hover:text-black transition">About Us</a>
                        </div>

                        <div className="flex-1" />

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2">
                            {/* SEARCH */}
                            <button
                                onClick={() => {
                                    setSearchOpen((value) => !value);
                                    setMobileMenuOpen(false);
                                }}
                                aria-label="Search products"
                                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>
                            </button>

                            {/* PROFILE */}
                            {!checkingAuth && user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setProfileOpen((value) => !value);
                                            setMobileMenuOpen(false);
                                        }}
                                        aria-label="Open profile menu"
                                        className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="8" r="3.5" />
                                            <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
                                        </svg>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 z-10000">
                                            <div className="px-3 py-3 border-b border-gray-100">
                                                <p className="font-semibold truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                                            </div>
                                            <a href="/account" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Account</a>
                                            <a href="/account/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Orders</a>
                                            <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <a href="/login" className="hidden sm:flex w-11 h-11 rounded-full bg-black text-white items-center justify-center" aria-label="Login">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="3.5" />
                                        <path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" />
                                    </svg>
                                </a>
                            )}

                            {/* CART */}
                            <a href="/cart" aria-label="Cart" className="relative w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 8h12l1 12H5L6 8Z" />
                                    <path d="M9 8a3 3 0 0 1 6 0" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </a>

                            {/* MOBILE MENU TOGGLE */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen((value) => !value);
                                    setProfileOpen(false);
                                    setSearchOpen(false);
                                }}
                                className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 6l12 12" />
                                        <path d="M18 6L6 18" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 6h16" />
                                        <path d="M4 12h16" />
                                        <path d="M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    {searchOpen && (
                        <div className="pb-4 relative z-10000">
                            <div className="relative">
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
                                    className="w-full bg-gray-50 border border-gray-300 rounded-full pl-12 pr-14 py-3 text-sm outline-none focus:border-gray-500 focus:bg-white transition"
                                />
                                <button
                                    onClick={() => { setSearch(""); setSearchOpen(false); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                                    aria-label="Close search"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 6l12 12" />
                                        <path d="M18 6L6 18" />
                                    </svg>
                                </button>

                                {search.trim() && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10001">
                                        {searchResults.length > 0 ? searchResults.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`/product/${item.id}`}
                                                onClick={() => { setSearch(""); setSearchOpen(false); }}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">RT18</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">₹{Number(item.discount_price ?? item.price).toFixed(0)}</p>
                                                </div>
                                            </a>
                                        )) : (
                                            <div className="p-5 text-sm text-gray-500 text-center">No products found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* MOBILE TOP-DOWN MENU */}
                {mobileMenuOpen && (
                    <>
                        <div
                            className="lg:hidden fixed inset-0 top-20 bg-black/20 z-4998"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-2xl z-4999 max-h-[calc(100vh-80px)] overflow-y-auto">
                            <div className="px-5 py-4">
                                <a href="/" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">Home</a>
                                <a href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">Shop</a>
                                <a href="/#categories" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">Categories</a>
                                <a href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">About Us</a>

                                <div className="my-2 border-t border-gray-100" />

                                {!checkingAuth && user ? (
                                    <>
                                        <a href="/account" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">My Account</a>
                                        <a href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">My Orders</a>
                                        <button onClick={logout} className="w-full text-left px-5 py-4 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition">Logout</button>
                                    </>
                                ) : (
                                    <a href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition">Login</a>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* PRODUCT */}

            <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-14">

                <button
                    onClick={() => router.back()}
                    className="text-sm font-semibold text-gray-500 hover:text-black mb-8"
                >
                    ← Back
                </button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-14">

                    {/* IMAGE GALLERY */}

                    <div className="relative">

                        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">

                            <div className="relative">

                                {selectedImage ? (

                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="w-full aspect-square object-cover"
                                    />

                                ) : (

                                    <div className="aspect-square flex items-center justify-center text-gray-300 text-6xl font-black">
                                        RT18
                                    </div>

                                )}

                                {hasDiscount && (
                                    <span className="absolute top-5 left-5 bg-black text-white px-3 py-2 rounded-xl text-sm font-bold">
                                        {discountPercent}% OFF
                                    </span>
                                )}

                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">

                                        <span className="bg-white text-black px-5 py-3 rounded-xl font-bold">
                                            OUT OF STOCK
                                        </span>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* THUMBNAILS */}

                        {galleryImages.length > 1 && (

                            <div className="grid grid-cols-4 gap-3 mt-4">

                                {galleryImages.map((image) => (

                                    <button
                                        key={image.id}
                                        onClick={() =>
                                            setSelectedImage(
                                                image.image_url
                                            )
                                        }
                                        className={`relative rounded-xl overflow-hidden border-2 transition ${selectedImage === image.image_url
                                            ? "border-black"
                                            : "border-transparent"
                                            }`}
                                    >

                                        <img
                                            src={image.image_url}
                                            alt={product.name}
                                            className="w-full aspect-square object-cover"
                                        />

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                    {/* DETAILS */}

                    <div className="flex flex-col justify-center">

                        {product.category_name && (
                            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">
                                {product.category_name}
                            </p>
                        )}

                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-3 leading-tight">
                            {product.name}
                        </h1>

                        {/* PRICE */}

                        <div className="flex items-center gap-3 flex-wrap mt-6">

                            <span className="text-3xl font-black">
                                ₹{sellingPrice.toFixed(0)}
                            </span>

                            {hasDiscount && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{Number(product.price).toFixed(0)}
                                    </span>

                                    <span className="text-sm font-bold text-green-600">
                                        ₹{discount} OFF
                                    </span>
                                </>
                            )}

                        </div>

                        {/* STOCK */}

                        <div className="mt-5">

                            {product.stock <= 0 ? (

                                <span className="text-red-600 font-semibold">
                                    Currently unavailable
                                </span>

                            ) : product.stock <= 5 ? (

                                <span className="text-orange-600 font-semibold">
                                    Only {product.stock} left in stock
                                </span>

                            ) : (

                                <span className="text-green-600 font-semibold">
                                    ✓ In stock
                                </span>

                            )}

                        </div>

                        <div className="border-t border-gray-200 my-7" />

                        {/* QUANTITY */}

                        {product.stock > 0 && (

                            <div>

                                <p className="text-sm font-bold mb-3">
                                    Quantity
                                </p>

                                <div className="flex items-center border border-gray-200 bg-white rounded-xl w-fit overflow-hidden">

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(
                                                    1,
                                                    quantity - 1
                                                )
                                            )
                                        }
                                        className="w-12 h-12 text-xl hover:bg-gray-100 transition"
                                    >
                                        −
                                    </button>

                                    <span className="w-12 text-center font-bold">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.min(
                                                    product.stock,
                                                    quantity + 1
                                                )
                                            )
                                        }
                                        className="w-12 h-12 text-xl hover:bg-gray-100 transition"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        )}

                        {/* BUTTONS */}

                        <div className="space-y-3 mt-7">

                            <button
                                onClick={addToCart}
                                disabled={product.stock <= 0}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                {product.stock > 0
                                    ? "Add to Cart"
                                    : "Out of Stock"}
                            </button>

                            {product.stock > 0 && (
                                <button
                                    onClick={buyNow}
                                    className="w-full border-2 border-black text-black py-4 rounded-xl font-bold hover:bg-black hover:text-white transition"
                                >
                                    Buy Now
                                </button>
                            )}

                        </div>

                        {/* FEATURES */}

                        <div className="grid grid-cols-3 gap-3 mt-8">

                            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-xl">✓</div>
                                <p className="text-xs font-semibold mt-2">
                                    Quality
                                </p>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-xl">🔒</div>
                                <p className="text-xs font-semibold mt-2">
                                    Secure
                                </p>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-xl">🚚</div>
                                <p className="text-xs font-semibold mt-2">
                                    Delivery
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* FOOTER */}

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