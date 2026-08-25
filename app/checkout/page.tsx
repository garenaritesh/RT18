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
    // CHECK LOGIN + LOAD CART
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

                if (data.user) {
                    setName(data.user.name || "");
                    setPhone(data.user.phone || "");
                    setAddress(data.user.address || "");
                    setCity(data.user.city || "");
                    setPincode(data.user.pincode || "");
                }

                const savedCart = JSON.parse(
                    localStorage.getItem("cart") || "[]"
                );

                if (savedCart.length === 0) {
                    router.push("/cart");
                    return;
                }

                setCart(savedCart);
            } catch (error) {
                console.error("Checkout initialization error:", error);
                router.push("/login");
            } finally {
                setCheckingAuth(false);
            }
        }

        initializeCheckout();
    }, [router]);

    // =========================
    // TOTAL
    // =========================

    const totalAmount = cart.reduce(
        (total, item) =>
            total +
            Number(item.price) * Number(item.quantity),
        0
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

        if (
            !name ||
            !phone ||
            !address ||
            !city ||
            !pincode
        ) {
            alert("Please fill all delivery details");
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
                        totalAmount,
                        items: cart,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.removeItem("cart");

                    router.push(
                        `/order-success?orderId=${data.order.id}`
                    );
                } else {
                    alert(data.message || "Order failed");
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
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

                amount: data.order.amount,

                currency: "INR",

                name: "RT18",

                description: "RT18 Ecommerce Order",

                order_id: data.order.id,

                prefill: {
                    name,
                    contact: phone,
                },

                theme: {
                    color: "#000000",
                },

                handler: async function (payment: any) {
                    try {
                        const verifyResponse = await fetch(
                            "/api/payment/verify",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json",
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
                                    totalAmount,
                                    items: cart,
                                }),
                            }
                        );

                        const verifyData =
                            await verifyResponse.json();

                        if (verifyData.success) {
                            localStorage.removeItem("cart");

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
                        alert("Payment verification failed");
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
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
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
        <main className="min-h-screen bg-gray-100 py-8 px-4 md:px-8">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}

                <div className="mb-8">

                    <button
                        onClick={() => router.push("/cart")}
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Back to Cart
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
                        Checkout
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Complete your order securely.
                    </p>

                </div>

                {/* MAIN GRID */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT SIDE */}

                    <div className="lg:col-span-2 space-y-6">

                        {/* DELIVERY DETAILS */}

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Delivery Details
                            </h2>

                            <p className="text-sm text-gray-500 mt-1 mb-6">
                                Where should we deliver your order?
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <input
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                />

                                <input
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="Mobile Number"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                />

                                <textarea
                                    className="w-full md:col-span-2 border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="Full Address"
                                    rows={4}
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(e.target.value)
                                    }
                                />

                                <input
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) =>
                                        setCity(e.target.value)
                                    }
                                />

                                <input
                                    className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                                    placeholder="Pincode"
                                    type="number"
                                    value={pincode}
                                    onChange={(e) =>
                                        setPincode(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                        {/* PAYMENT METHOD */}

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Payment Method
                            </h2>

                            <p className="text-sm text-gray-500 mt-1 mb-5">
                                Choose how you want to pay.
                            </p>

                            <div className="space-y-3">

                                {/* COD */}

                                <label
                                    className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer ${paymentMethod === "COD"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200"
                                        }`}
                                >

                                    <div className="flex items-center gap-3">

                                        <input
                                            type="radio"
                                            value="COD"
                                            checked={
                                                paymentMethod === "COD"
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Cash on Delivery
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Pay when your order arrives
                                            </p>
                                        </div>

                                    </div>

                                    <span className="text-lg">
                                        💵
                                    </span>

                                </label>

                                {/* RAZORPAY */}

                                <label
                                    className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer ${paymentMethod === "RAZORPAY"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200"
                                        }`}
                                >

                                    <div className="flex items-center gap-3">

                                        <input
                                            type="radio"
                                            value="RAZORPAY"
                                            checked={
                                                paymentMethod ===
                                                "RAZORPAY"
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Online Payment
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Secure payment with Razorpay
                                            </p>
                                        </div>

                                    </div>

                                    <span className="text-lg">
                                        💳
                                    </span>

                                </label>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="lg:col-span-1">

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Order Summary
                            </h2>

                            {/* PRODUCTS */}

                            <div className="mt-5 space-y-4">

                                {cart.map((item) => (

                                    <div
                                        key={item.id}
                                        className="flex gap-3"
                                    >

                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                                                📦
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">

                                            <p className="font-semibold text-gray-900 truncate">
                                                {item.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Qty: {item.quantity}
                                            </p>

                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                ₹
                                                {(
                                                    Number(item.price) *
                                                    Number(item.quantity)
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>

                            {/* TOTAL */}

                            <div className="border-t border-gray-200 mt-6 pt-5 space-y-3">

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹{totalAmount.toFixed(2)}
                                    </span>

                                </div>

                                <div className="flex justify-between text-gray-600">

                                    <span>
                                        Delivery
                                    </span>

                                    <span className="font-semibold text-green-600">
                                        FREE
                                    </span>

                                </div>

                                <div className="border-t border-gray-200 pt-4 flex justify-between">

                                    <span className="font-bold text-gray-900">
                                        Total
                                    </span>

                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{totalAmount.toFixed(2)}
                                    </span>

                                </div>

                            </div>

                            {/* PLACE ORDER */}

                            <button
                                onClick={placeOrder}
                                disabled={loading}
                                className="w-full mt-6 bg-black text-white p-4 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading
                                    ? "Processing..."
                                    : paymentMethod === "COD"
                                        ? "Place COD Order"
                                        : "Pay Securely"}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Your payment information is securely processed.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}