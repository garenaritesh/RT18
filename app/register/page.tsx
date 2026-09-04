"use client";

import { useState } from "react";

import logo from "../assests/brand_new.png";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function registerUser() {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Required fields validation
        if (!cleanName || !cleanEmail || !password) {
            alert("Please fill all fields");
            return;
        }

        // Gmail validation
        // Email must be in format: example@gmail.com
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailRegex.test(cleanEmail)) {
            alert("Please enter a valid Gmail address ending with @gmail.com");
            return;
        }

        // Prevent spaces inside email
        if (/\s/.test(cleanEmail)) {
            alert("Email address cannot contain spaces");
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
                    name: cleanName,
                    email: cleanEmail,
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
                    <div className="flex justify-center">
                        <img
                            src={logo.src}
                            alt="RT18"
                            className="h-30 w-auto object-contain"
                        />
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
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
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
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
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