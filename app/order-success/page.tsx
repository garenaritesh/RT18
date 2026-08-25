"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function OrderSuccessContent() {
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setOrderId(params.get("orderId"));
    }, []);

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-10 text-center">

                {/* SUCCESS ICON */}

                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-4xl">
                    ✓
                </div>

                {/* TITLE */}

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6">
                    Order Confirmed!
                </h1>

                <p className="text-gray-500 mt-3">
                    Thank you for shopping with RT18.
                </p>

                {/* ORDER ID */}

                {orderId && (
                    <div className="mt-7 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <p className="text-sm text-gray-500">
                            Your Order ID
                        </p>

                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            #{orderId}
                        </p>
                    </div>
                )}

                {/* MESSAGE */}

                <div className="mt-6">
                    <p className="text-gray-700">
                        Your order has been successfully placed.
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        You can track your order anytime from your account.
                    </p>
                </div>

                {/* ACTIONS */}

                {orderId && (
                    <Link
                        href={`/account/orders/${orderId}`}
                        className="block mt-7 w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800"
                    >
                        View & Track Order
                    </Link>
                )}

                <Link
                    href="/shop"
                    className="block mt-3 w-full border border-gray-300 text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-50"
                >
                    Continue Shopping
                </Link>

                <Link
                    href="/"
                    className="inline-block mt-5 text-sm text-gray-500 hover:text-black"
                >
                    ← Back to Home
                </Link>

            </div>

        </main>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={null}>
            <OrderSuccessContent />
        </Suspense>
    );
}