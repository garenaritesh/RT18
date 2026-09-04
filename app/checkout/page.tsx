"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type CartItem = {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
};

export default function CheckoutPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [cart, setCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // =========================
    // CHECK LOGIN + LOAD USER + CART
    // =========================

    useEffect(() => {
        async function initializeCheckout() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (!data.success) {
                    alert("Please login before checkout");
                    router.push("/login");
                    return;
                }

                // Load saved profile details
                if (data.user) {
                    setName(data.user.name || "");
                    setPhone(data.user.phone || "");
                    setAddress(data.user.address || "");
                    setCity(data.user.city || "");
                    setPincode(data.user.pincode || "");
                }

                // Load cart
                const cartResponse = await fetch("/api/cart");
                const cartData = await cartResponse.json();
                const savedCart = cartData.cart || [];

                if (savedCart.length === 0) {
                    router.push("/cart");
                    return;
                }

                setCart(savedCart);
            } catch (error) {
                console.error(
                    "Checkout initialization error:",
                    error
                );

                router.push("/login");
            } finally {
                setCheckingAuth(false);
            }
        }

        initializeCheckout();
    }, [router]);

    // =========================
    // SUBTOTAL
    // =========================

    const subtotal = cart.reduce(
        (total, item) =>
            total +
            Number(item.price) * Number(item.quantity),
        0
    );

    // =========================
    // SHIPPING
    // =========================
    // Above ₹500 = FREE
    // ₹500 or below = ₹50

    const shippingCharge = subtotal > 500 ? 0 : 50;

    // =========================
    // PAYMENT OFFER
    // =========================

    const COD_CHARGE = 0;
    const ONLINE_DISCOUNT = 20;

    // Change to true when Razorpay LIVE payments are ready.
    const ONLINE_PAYMENT_ENABLED = false;

    const paymentAdjustment =
        paymentMethod === "COD"
            ? COD_CHARGE
            : -ONLINE_DISCOUNT;

    // Amount before payment offer
    const baseTotal = subtotal + shippingCharge;

    // Final amount customer actually pays
    const totalAmount = Math.max(
        0,
        baseTotal + paymentAdjustment
    );

    // =========================
    // RAZORPAY SCRIPT
    // =========================

    function loadRazorpayScript() {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);

            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    }

    // =========================
    // PLACE ORDER
    // =========================

    async function placeOrder() {
        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        // Address is coming from profile
        if (
            !name ||
            !phone ||
            !address ||
            !city ||
            !pincode
        ) {
            alert(
                "Please complete your delivery address from your profile first."
            );

            router.push("/account/profile");
            return;
        }

        setLoading(true);

        // =========================
        // COD
        // =========================

        if (paymentMethod === "COD") {
            try {
                const response = await fetch("/api/orders", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        name,
                        phone,
                        address,
                        city,
                        pincode,

                        paymentMethod: "COD",

                        // Final amount after ₹20 COD charge
                        totalAmount,

                        subtotal,
                        shippingCharge,

                        // Useful if backend wants to know
                        paymentAdjustment,

                        items: cart,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    await fetch("/api/cart", { method: "DELETE" });

                    router.push(
                        `/order-success?orderId=${data.order.id}`
                    );
                } else {
                    alert(
                        data.message ||
                        "Order failed"
                    );
                }
            } catch (error) {
                console.error(error);

                alert("Something went wrong");
            } finally {
                setLoading(false);
            }

            return;
        }

        // =========================
        // RAZORPAY
        // =========================

        // Temporarily keep online payment disabled until Razorpay LIVE mode is ready.
        if (!ONLINE_PAYMENT_ENABLED) {
            setLoading(false);
            alert("Online payment is currently unavailable. Please use Cash on Delivery.");
            return;
        }

        const loaded = await loadRazorpayScript();

        if (!loaded) {
            setLoading(false);

            alert("Razorpay failed to load");

            return;
        }

        try {
            const response = await fetch("/api/razorpay", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    // Online payment gets ₹20 OFF
                    amount: totalAmount,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setLoading(false);

                alert("Unable to create payment");

                return;
            }

            const options = {
                key:
                    process.env
                        .NEXT_PUBLIC_RAZORPAY_KEY_ID,

                amount: data.order.amount,

                currency: "INR",

                name: "RT18",

                description:
                    "RT18 Ecommerce Order",

                order_id: data.order.id,

                prefill: {
                    name,
                    contact: phone,
                },

                theme: {
                    color: "#000000",
                },

                handler: async function (
                    payment: any
                ) {
                    try {
                        const verifyResponse =
                            await fetch(
                                "/api/payment/verify",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },

                                    body: JSON.stringify({
                                        razorpay_order_id:
                                            payment.razorpay_order_id,

                                        razorpay_payment_id:
                                            payment.razorpay_payment_id,

                                        razorpay_signature:
                                            payment.razorpay_signature,

                                        name,
                                        phone,
                                        address,
                                        city,
                                        pincode,

                                        // Final online amount
                                        totalAmount,

                                        subtotal,
                                        shippingCharge,

                                        paymentAdjustment,

                                        items: cart,
                                    }),
                                }
                            );

                        const verifyData =
                            await verifyResponse.json();

                        if (verifyData.success) {
                            await fetch("/api/cart", { method: "DELETE" });

                            router.push(
                                `/order-success?orderId=${verifyData.order.id}`
                            );
                        } else {
                            alert(
                                verifyData.message ||
                                "Payment verification failed"
                            );
                        }
                    } catch (error) {
                        console.error(error);

                        alert(
                            "Payment verification failed"
                        );
                    } finally {
                        setLoading(false);
                    }
                },
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response: any) {
                    console.error(
                        "Payment failed:",
                        response.error
                    );

                    alert(
                        `Payment failed!\n${response.error.description}`
                    );

                    setLoading(false);
                }
            );

            razorpay.open();
        } catch (error) {
            console.error(error);

            alert("Unable to start payment");

            setLoading(false);
        }
    }

    // =========================
    // LOADING
    // =========================

    if (checkingAuth) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <p className="text-gray-500">
                    Preparing checkout...
                </p>
            </main>
        );
    }

    // =========================
    // CHECKOUT UI
    // =========================

    return (
        <main className="min-h-screen bg-gray-100 py-6 md:py-8 px-3 sm:px-4 md:px-8">

            <div className="max-w-6xl mx-auto">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="mb-5 md:mb-8">

                    <button
                        onClick={() =>
                            router.push("/cart")
                        }
                        className="text-sm text-gray-500 hover:text-black transition"
                    >
                        ← Back to Cart
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 md:mt-4">
                        Checkout
                    </h1>

                    <p className="text-gray-500 mt-1.5">
                        Complete your order securely.
                    </p>

                </div>

                {/* =========================
                    MAIN GRID
                ========================= */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

                    {/* =========================
                        ORDER SUMMARY
                        MOBILE FIRST
                    ========================= */}

                    <div className="lg:col-span-1 lg:order-2 order-1">

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 lg:sticky lg:top-6">

                            <div className="flex items-center justify-between">

                                <h2 className="text-xl font-bold text-gray-900">
                                    Order Summary
                                </h2>

                                <span className="text-xs text-gray-500">
                                    {cart.reduce(
                                        (count, item) =>
                                            count +
                                            Number(
                                                item.quantity
                                            ),
                                        0
                                    )}{" "}
                                    item
                                    {cart.reduce(
                                        (count, item) =>
                                            count +
                                            Number(
                                                item.quantity
                                            ),
                                        0
                                    ) !== 1
                                        ? "s"
                                        : ""}
                                </span>

                            </div>

                            {/* PRODUCTS */}

                            <div className="mt-5 space-y-4">

                                {cart.map((item) => (

                                    <div
                                        key={item.id}
                                        className="flex gap-3"
                                    >

                                        {item.image_url ? (
                                            <img
                                                src={
                                                    item.image_url
                                                }
                                                alt={
                                                    item.name
                                                }
                                                className="w-16 h-16 rounded-xl object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                                📦
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">

                                            <p className="font-semibold text-gray-900 line-clamp-2">
                                                {item.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                ₹
                                                {(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    Number(
                                                        item.quantity
                                                    )
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>

                            {/* TOTAL BREAKDOWN */}

                            <div className="border-t border-gray-200 mt-6 pt-5 space-y-3">

                                {/* SUBTOTAL */}

                                <div className="flex justify-between text-gray-600">
                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹
                                        {subtotal.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                                {/* DELIVERY */}

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Delivery
                                    </span>

                                    {shippingCharge ===
                                        0 ? (
                                        <span className="font-semibold text-green-600">
                                            FREE
                                        </span>
                                    ) : (
                                        <span className="font-semibold text-gray-900">
                                            ₹
                                            {shippingCharge.toFixed(
                                                2
                                            )}
                                        </span>
                                    )}

                                </div>

                                {/* PAYMENT OFFER */}

                                {paymentMethod ===
                                    "COD" ? (
                                    <div className="flex justify-between text-gray-600">

                                        <span>
                                            COD handling
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            +₹0
                                        </span>

                                    </div>
                                ) : (
                                    <div className="flex justify-between">

                                        <span className="text-gray-600">
                                            Online payment offer
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            -₹20
                                        </span>

                                    </div>
                                )}

                                {/* FREE SHIPPING NOTE */}

                                <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                                    🚚 Free shipping on orders above ₹500
                                </div>

                                {/* FINAL TOTAL */}

                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">

                                    <span className="font-bold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹
                                        {totalAmount.toFixed(
                                            2
                                        )}
                                    </span>

                                </div>

                            </div>

                            {/* PLACE ORDER */}

                            <button
                                onClick={
                                    placeOrder
                                }
                                disabled={loading}
                                className="w-full mt-6 bg-black text-white p-4 rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50"
                            >
                                {loading
                                    ? "Processing..."
                                    : paymentMethod ===
                                        "COD"
                                        ? "Place COD Order"
                                        : "Pay Securely"}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                🔒 Secure checkout
                            </p>

                        </div>

                    </div>

                    {/* =========================
                        LEFT SIDE
                    ========================= */}

                    <div className="lg:col-span-2 space-y-5 md:space-y-6 lg:order-1">

                        {/* =========================
                            PAYMENT METHOD
                            MOBILE SECOND
                        ========================= */}

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 order-2">

                            <div className="flex items-center justify-between mb-5">

                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Payment Method
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose how you want to pay.
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-3">

                                {/* =========================
                                    COD
                                ========================= */}

                                <label
                                    className={`block border rounded-xl p-4 cursor-pointer transition ${paymentMethod ===
                                        "COD"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >

                                    <div className="flex items-center justify-between gap-3">

                                        <div className="flex items-center gap-3">

                                            <input
                                                type="radio"
                                                value="COD"
                                                checked={
                                                    paymentMethod ===
                                                    "COD"
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setPaymentMethod(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <div>

                                                <div className="flex items-center gap-2">

                                                    <p className="font-semibold text-gray-900">
                                                        Cash on Delivery
                                                    </p>

                                                    <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        No extra fee
                                                    </span>

                                                </div>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    Pay when your order arrives
                                                </p>

                                            </div>

                                        </div>

                                        <span className="text-lg">
                                            💵
                                        </span>

                                    </div>

                                </label>

                                {/* =========================
                                    ONLINE PAYMENT
                                ========================= */}

                                <div className="relative overflow-hidden rounded-xl">
                                    {!ONLINE_PAYMENT_ENABLED && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <span className="inline-flex items-center rounded-full bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                                                Online Payments • Coming Soon
                                            </span>
                                        </div>
                                    )}

                                    <label
                                        className={`block border rounded-xl p-4 transition ${ONLINE_PAYMENT_ENABLED
                                                ? `cursor-pointer ${paymentMethod === "RAZORPAY"
                                                    ? "border-black bg-gray-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`
                                                : "border-gray-200 bg-gray-50/80 cursor-not-allowed"
                                            }`}
                                    >
                                        <div className={!ONLINE_PAYMENT_ENABLED ? "opacity-60 blur-[0.3px]" : ""}>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        value="RAZORPAY"
                                                        checked={paymentMethod === "RAZORPAY"}
                                                        disabled={!ONLINE_PAYMENT_ENABLED}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="disabled:cursor-not-allowed"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900">Online Payment</p>
                                                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${ONLINE_PAYMENT_ENABLED
                                                                    ? "bg-green-50 text-green-600"
                                                                    : "bg-gray-200 text-gray-600"
                                                                }`}>
                                                                {ONLINE_PAYMENT_ENABLED ? "₹20 OFF" : "Available in Future"}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {ONLINE_PAYMENT_ENABLED
                                                                ? "Pay securely with Razorpay"
                                                                : "Online payment will be available soon."}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-lg">💳</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                            </div>

                            {/* OFFER MESSAGE */}

                            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">

                                {!ONLINE_PAYMENT_ENABLED ? (
                                    <p className="text-xs text-gray-600">
                                        💳 Online payments will be accepted in the future. For now, securely place your order with{" "}
                                        <span className="font-semibold text-gray-900">
                                            Cash on Delivery
                                        </span>.
                                    </p>
                                ) : paymentMethod === "COD" ? (
                                    <p className="text-xs text-gray-600">
                                        💡 Prefer online payment?{" "}
                                        <span className="font-semibold text-green-600">
                                            Save ₹20
                                        </span>{" "}
                                        by paying online.
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-600">
                                        🎉 You're saving{" "}
                                        <span className="font-semibold text-green-600">
                                            ₹20
                                        </span>{" "}
                                        with online payment.
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* =========================
                            DELIVERY ADDRESS
                            MOBILE THIRD
                        ========================= */}

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 order-3">

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Delivery Address
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Your saved profile address
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        router.push(
                                            "/account/profile"
                                        )
                                    }
                                    className="shrink-0 text-sm font-semibold text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Change
                                </button>

                            </div>

                            {/* SAVED ADDRESS CARD */}

                            <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">

                                <div className="flex items-start gap-3">

                                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                                        📍
                                    </div>

                                    <div className="min-w-0">

                                        <p className="font-semibold text-gray-900">
                                            {name ||
                                                "Your Name"}
                                        </p>

                                        <p className="text-sm text-gray-600 mt-1">
                                            {phone ||
                                                "Mobile Number"}
                                        </p>

                                        <p className="text-sm text-gray-600 mt-2 leading-6">
                                            {address ||
                                                "No address saved"}
                                            {city
                                                ? `, ${city}`
                                                : ""}
                                            {pincode
                                                ? ` - ${pincode}`
                                                : ""}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* NO ADDRESS WARNING */}

                            {(!address ||
                                !city ||
                                !pincode) && (
                                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                                        <p className="text-sm font-semibold text-red-700">
                                            Delivery address is incomplete.
                                        </p>

                                        <button
                                            onClick={() =>
                                                router.push(
                                                    "/account/profile"
                                                )
                                            }
                                            className="text-xs font-semibold text-red-600 mt-1 underline"
                                        >
                                            Complete your address
                                        </button>

                                    </div>
                                )}

                            <p className="text-xs text-gray-400 mt-4">
                                Need to change your delivery
                                address? Update it from your
                                profile.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}