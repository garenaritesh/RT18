"use client";

import { useState } from "react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function registerUser() {
        if (!name || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                alert("Registration successful!");

                window.location.href = "/";
            } else {
                alert(data.message || "Registration failed");
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

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold mx-auto">
                        RT
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mt-4">
                        Create Account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Create your RT18 account
                    </p>
                </div>

                <div className="space-y-4">

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                    />

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
                        onClick={registerUser}
                        disabled={loading}
                        className="w-full bg-black text-white p-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-black font-semibold hover:underline"
                    >
                        Login
                    </a>
                </p>

            </div>
        </main>
    );
}