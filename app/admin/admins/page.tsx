"use client";

import { useEffect, useState } from "react";

type Admin = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
};

export default function AdminManagementPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    async function loadAdmins() {
        try {
            const response = await fetch("/api/admin/admins");
            const data = await response.json();

            if (data.success) {
                setAdmins(data.admins);
            }
        } catch (error) {
            console.error("Load admins error:", error);
        } finally {
            setLoadingAdmins(false);
        }
    }

    useEffect(() => {
        loadAdmins();
    }, []);

    async function createAdmin() {
        if (!name || !email || !password) {
            alert("Please fill all details");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/admin/admins", {
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
                alert("Admin created successfully!");

                setName("");
                setEmail("");
                setPassword("");

                loadAdmins();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Create admin error:", error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function toggleAdminStatus(admin: Admin) {
        const newStatus = !admin.is_active;

        const action = newStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${admin.name}?`
        );

        if (!confirmed) {
            return;
        }

        setUpdatingId(admin.id);

        try {
            const response = await fetch("/api/admin/admins", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: admin.id,
                    isActive: newStatus,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAdmins((currentAdmins) =>
                    currentAdmins.map((item) =>
                        item.id === admin.id
                            ? {
                                ...item,
                                is_active: newStatus,
                            }
                            : item
                    )
                );
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(
                "Update admin status error:",
                error
            );

            alert("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <main className="max-w-5xl mx-auto">

            {/* HEADER */}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Admin Management
                </h1>

                <p className="text-gray-500 mt-1">
                    Create and manage store administrators.
                </p>
            </div>

            {/* ADD ADMIN */}

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-xl">

                <h2 className="text-xl font-bold text-gray-900">
                    Add New Admin
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    New admins will have full store access.
                </p>

                <div className="space-y-4 mt-6">

                    {/* NAME */}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Name
                        </label>

                        <input
                            type="text"
                            placeholder="Admin name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className="w-full border border-gray-300 p-3 rounded-xl text-gray-900"
                        />
                    </div>

                    {/* EMAIL */}

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
                            className="w-full border border-gray-300 p-3 rounded-xl text-gray-900"
                        />
                    </div>

                    {/* PASSWORD */}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Admin password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 p-3 rounded-xl text-gray-900"
                        />
                    </div>

                    <button
                        onClick={createAdmin}
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Admin"}
                    </button>

                </div>
            </div>

            {/* ADMIN LIST */}

            <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-xl font-bold text-gray-900">
                        Existing Admins
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        All administrators of your store.
                    </p>

                </div>

                {loadingAdmins ? (

                    <div className="p-8 text-center text-gray-500">
                        Loading admins...
                    </div>

                ) : admins.length === 0 ? (

                    <div className="p-8 text-center text-gray-500">
                        No admins found.
                    </div>

                ) : (

                    <div className="divide-y divide-gray-100">

                        {admins.map((admin) => (

                            <div
                                key={admin.id}
                                className="p-5 flex items-center justify-between gap-4"
                            >

                                {/* ADMIN INFO */}

                                <div className="flex items-center gap-4">

                                    <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">
                                        {admin.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <p className="font-bold text-gray-900">
                                            {admin.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {admin.email}
                                        </p>

                                    </div>

                                </div>

                                {/* ROLE + STATUS + ACTION */}

                                <div className="text-right">

                                    {/* ROLE */}

                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${admin.role ===
                                                "MAIN_ADMIN"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {admin.role ===
                                            "MAIN_ADMIN"
                                            ? "MAIN ADMIN"
                                            : "ADMIN"}
                                    </span>

                                    {/* STATUS */}

                                    <div className="mt-2">

                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${admin.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {admin.is_active
                                                ? "Active"
                                                : "Deactivated"}
                                        </span>

                                    </div>

                                    {/* CREATED DATE */}

                                    <p className="text-xs text-gray-400 mt-2">
                                        Created{" "}
                                        {new Date(
                                            admin.created_at
                                        ).toLocaleDateString()}
                                    </p>

                                    {/* ACTION */}

                                    {admin.role !==
                                        "MAIN_ADMIN" && (
                                            <button
                                                onClick={() =>
                                                    toggleAdminStatus(
                                                        admin
                                                    )
                                                }
                                                disabled={
                                                    updatingId ===
                                                    admin.id
                                                }
                                                className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${admin.is_active
                                                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                        : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    }`}
                                            >
                                                {updatingId ===
                                                    admin.id
                                                    ? "Updating..."
                                                    : admin.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                            </button>
                                        )}

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </main>
    );
}