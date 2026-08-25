"use client";

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

    function addToCart() {
        if (!product) return;

        if (product.stock <= 0) {
            alert("This product is out of stock");
            return;
        }

        if (quantity > product.stock) {
            alert("Maximum available stock reached");
            return;
        }

        const cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const existing = cart.find(
            (item: any) => item.id === product.id
        );

        if (existing) {
            if (
                existing.quantity + quantity >
                product.stock
            ) {
                alert("Maximum available stock reached");
                return;
            }

            existing.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: getSellingPrice(),
                image_url: product.image_url,
                quantity,
            });
        }

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        alert("Product added to cart!");
    }

    function buyNow() {
        if (!product) return;

        if (product.stock <= 0) {
            alert("This product is out of stock");
            return;
        }

        if (quantity > product.stock) {
            alert("Maximum available stock reached");
            return;
        }

        const cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const existing = cart.find(
            (item: any) => item.id === product.id
        );

        if (existing) {
            if (
                existing.quantity + quantity >
                product.stock
            ) {
                alert("Maximum available stock reached");
                return;
            }

            existing.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: getSellingPrice(),
                image_url: product.image_url,
                quantity,
            });
        }

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        router.push("/checkout");
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

            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">

                <div className="max-w-7xl mx-auto px-5 md:px-8">

                    <div className="h-20 flex items-center justify-between">

                        <a
                            href="/"
                            className="text-2xl md:text-3xl font-black tracking-tight"
                        >
                            RT18
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

                        </div>

                        <div className="flex items-center gap-3">

                            <a
                                href="/cart"
                                className="border border-gray-200 bg-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                            >
                                Cart 🛒
                            </a>

                            <a
                                href="/account"
                                className="hidden sm:block bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                            >
                                Account
                            </a>

                        </div>

                    </div>

                </div>

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