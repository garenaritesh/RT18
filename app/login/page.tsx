"use client";

import { useState } from "react";
import logo from "../assests/brand_new.png";

type AuthStep = "lookup" | "signin" | "signup";

function getSafeRedirectPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) {
        return next;
    }

    return "/";
}

export default function LoginPage() {
    const [step, setStep] = useState<AuthStep>("lookup");
    const [identifier, setIdentifier] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    function resetToLookup() {
        setStep("lookup");
        setName("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    }

    async function continueAuth() {
        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/lookup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier: cleanIdentifier }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to check account");
            }

            if (data.exists) {
                setStep("signin");
            } else {
                setStep("signup");
            }
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to continue");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin() {
        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier || !password) {
            setError("Please enter your email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: cleanIdentifier,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

            window.location.href = getSafeRedirectPath();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister() {
        const cleanIdentifier = identifier.trim();
        const cleanName = name.trim();

        if (!cleanName) {
            setError("Please enter your name");
            return;
        }

        if (!cleanIdentifier) {
            setError("Please enter your email address");
            return;
        }

        if (!password) {
            setError("Please create a password");
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

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: cleanName,
                    email: cleanIdentifier,
                    phone: phone.trim(),
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Account creation failed");
            }

            window.location.href = getSafeRedirectPath();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Account creation failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center">
                        <img src={logo.src} alt="RT18" className="h-20 sm:h-24 w-auto object-contain" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">
                        {step === "lookup" ? "Welcome to RT18" : step === "signin" ? "Sign In" : "Create Account"}
                    </h1>

                    <p className="text-gray-500 mt-2 text-sm sm:text-base">
                        {step === "lookup"
                            ? "Enter your email address to continue."
                            : step === "signin"
                                ? `Continue with ${identifier}`
                                : `Create your account with ${identifier}`}
                    </p>
                </div>

                <div className="space-y-4">
                    {step === "lookup" && (
                        <>
                            <input
                                type="email"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                placeholder="Email"
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                            />

                            <button
                                type="button"
                                onClick={() => void continueAuth()}
                                disabled={loading}
                                className="w-full bg-black text-white p-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? "Checking..." : "Continue"}
                            </button>

                            <a
                                href={`/forgot-password?email=${encodeURIComponent(identifier)}`}
                                className="block text-center text-sm font-medium text-gray-600 hover:text-black hover:underline"
                            >
                                Forgot password?
                            </a>
                        </>
                    )}

                    {step === "signin" && (
                        <>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                {identifier}
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                    className="w-full border border-gray-300 p-3 pr-12 rounded-xl text-gray-900 outline-none focus:border-black"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleLogin()}
                                disabled={loading}
                                className="w-full bg-black text-white p-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>

                            <a
                                href={`/forgot-password?email=${encodeURIComponent(identifier)}`}
                                className="block text-center text-sm font-medium text-gray-600 hover:text-black hover:underline"
                            >
                                Forgot password?
                            </a>

                            <button
                                type="button"
                                onClick={resetToLookup}
                                className="w-full text-sm font-medium text-gray-600 hover:text-black"
                            >
                                ← Change email
                            </button>
                        </>
                    )}

                    {step === "signup" && (
                        <>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Full Name"
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                            />

                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                Email: {identifier}
                            </div>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder="Phone (optional)"
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                    className="w-full border border-gray-300 p-3 pr-12 rounded-xl text-gray-900 outline-none focus:border-black"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Confirm Password"
                                className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                            />

                            <button
                                type="button"
                                onClick={() => void handleRegister()}
                                disabled={loading}
                                className="w-full bg-black text-white p-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </button>

                            <button
                                type="button"
                                onClick={resetToLookup}
                                className="w-full text-sm font-medium text-gray-600 hover:text-black"
                            >
                                ← Change email
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        {error}
                    </p>
                )}

                {step !== "lookup" && (
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Need a different account?{" "}
                        <button type="button" onClick={resetToLookup} className="text-black font-semibold hover:underline">
                            Use another email
                        </button>
                    </p>
                )}
            </div>
        </main>
    );
}