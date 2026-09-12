"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function resetPassword() {
        if (!token) {
            setError("This reset link is missing its token");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to reset password");
            }

            setMessage(data.message);
            setPassword("");
            setConfirmPassword("");
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : "Unable to reset password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
                <p className="mt-2 text-sm text-gray-500">Choose a new password for your RT18 account.</p>

                <div className="mt-6 space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="New password"
                        className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-black"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-black"
                    />
                    <button
                        type="button"
                        onClick={() => void resetPassword()}
                        disabled={loading || !token}
                        className="w-full rounded-xl bg-black p-3 font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Reset password"}
                    </button>
                </div>

                {message && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                <Link href="/login" className="mt-6 block text-center text-sm font-medium text-gray-600 hover:text-black hover:underline">
                    Back to login
                </Link>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<main className="min-h-screen bg-gray-100" />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
