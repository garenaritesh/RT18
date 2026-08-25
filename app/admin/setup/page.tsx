"use client";

import { useState } from "react";

export default function AdminSetupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function createMainAdmin() {
        if (!name || !email || !password) {
            alert("Please fill all details");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/admin/setup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                alert("Main Admin created successfully!");

                setName("");
                setEmail("");
                setPassword("");
            } else {
                alert(data.message);
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

            <div className="w-full max-w-md bg-white rounded-2xl shadow p-7">

                <h1 className="text-2xl font-bold text-gray-900">
                    Main Admin Setup
                </h1>

                <p className="text-gray-500 text-sm mt-2">
                    Create the first Main Admin account.
                </p>

                <div className="space-y-4 mt-6">

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        className="w-full border p-3 rounded-lg text-gray-900"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="w-full border p-3 rounded-lg text-gray-900"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="w-full border p-3 rounded-lg text-gray-900"
                    />

                    <button
                        onClick={createMainAdmin}
                        disabled={loading}
                        className="w-full bg-black text-white p-3 rounded-lg disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Main Admin"}
                    </button>

                </div>

            </div>

        </main>
    );
}