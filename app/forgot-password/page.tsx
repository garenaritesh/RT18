"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function requestReset() {
        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanPhone = phone.replace(/\D/g, "");

        if (!cleanEmail && !cleanPhone) {
            setError("Please enter your email or phone number");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: cleanPhone }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to start password reset");
            }

            setMessage(data.message);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Unable to start password reset");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Send a request to support. We will reset your password and contact you manually.
                </p>

                <div className="mt-6 space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name (optional)"
                        className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-black"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-black"
                    />
                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Phone number (optional)"
                        className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-black"
                    />
                    <button
                        type="button"
                        onClick={() => void requestReset()}
                        disabled={loading}
                        className="w-full rounded-xl bg-black p-3 font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </div>

                {message && (
                    <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {message}
                    </p>
                )}

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                <Link href="/login" className="mt-6 block text-center text-sm font-medium text-gray-600 hover:text-black hover:underline">
                    Back to login
                </Link>
            </div>
        </main>
    );
}
