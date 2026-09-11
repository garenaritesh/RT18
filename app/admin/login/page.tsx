"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function login() {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
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
                window.location.href = "/admin";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Admin login error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-black text-gray-900">
                        RT18
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Admin Login
                    </p>

                </div>

                <div className="space-y-4">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Admin email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Admin password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        login();
                                    }
                                }}
                                className="w-full border border-gray-300 p-3 pr-16 rounded-xl text-gray-900 outline-none focus:border-black"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-black"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={login}
                        disabled={loading}
                        className="w-full bg-black text-white p-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </div>

            </div>

        </main>
    );
}