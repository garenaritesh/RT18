"use client";

import { useEffect, useState } from "react";

type User = {
    id: number;
    name: string;
    email: string;
};

export default function AccountPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (data.success) {
                    setUser(data.user);
                } else {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Account error:", error);
                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    async function logout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">
                    Loading account...
                </p>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6 md:p-10">

            {/* HEADER */}
            <div className="max-w-5xl mx-auto">

                <div className="mb-8">
                    <a
                        href="/"
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Back to Store
                    </a>

                    <h1 className="text-3xl font-bold text-gray-900 mt-4">
                        My Account
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage your account and orders.
                    </p>
                </div>

                {/* ACCOUNT INFO */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <div className="flex items-center gap-5">

                        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user.name}
                            </h2>

                            <p className="text-gray-500 mt-1">
                                {user.email}
                            </p>
                        </div>

                    </div>

                </div>

                {/* MENU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                    <a
                        href="/account/orders"
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                    >
                        <div className="text-3xl">
                            📦
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mt-4">
                            My Orders
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            View and track your orders.
                        </p>
                    </a>

                    <a
                        href="/account/profile"
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                    >
                        <div className="text-3xl">
                            👤
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mt-4">
                            Profile
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Your account information.
                        </p>
                    </a>

                </div>

                {/* LOGOUT */}
                <div className="mt-6">
                    <button
                        onClick={logout}
                        className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl font-semibold"
                    >
                        Logout
                    </button>
                </div>

            </div>

        </main>
    );
}