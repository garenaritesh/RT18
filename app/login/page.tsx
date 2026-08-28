"use client";

import { useState } from "react";
import logo from "../assests/brand_new.png";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function loginUser() {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Login successful!");
                window.location.href = "/";
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {/* LOGO */}
                <div className="text-center mb-8">
                    <div className="flex justify-center">
                        <img
                            src={logo.src}
                            alt="RT18"
                            className="h-30 w-auto object-contain"
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mt-4">
                        Welcome Back
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Login to your RT18 account
                    </p>
                </div>

                {/* FORM */}
                <div className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 p-3 pr-12 rounded-xl text-gray-900 outline-none focus:border-black"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <button
                        onClick={loginUser}
                        disabled={loading}
                        className="w-full bg-black text-white p-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>

                {/* REGISTER */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}

                    <a
                        href="/register"
                        className="text-black font-semibold hover:underline"
                    >
                        Create Account
                    </a>
                </p>

            </div>
        </main>
    );
}