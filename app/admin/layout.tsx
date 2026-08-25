import AdminLogout from "./AdminLogout";
import AdminStatusGuard from "./AdminStatusGuard";
import Link from "next/link";
import { ReactNode } from "react";
import { getAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const admin = await getAdmin();

    // Login page ko normal layout mat do
    if (!admin) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* SIDEBAR */}

            <aside className="w-64 bg-gray-950 text-white min-h-screen fixed left-0 top-0">

                {/* Logo */}

                <div className="h-20 flex items-center px-6 border-b border-gray-800">

                    <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black">
                        RT
                    </div>

                    <div className="ml-3">

                        <h1 className="font-bold text-lg">
                            RT18
                        </h1>

                        <p className="text-xs text-gray-400">
                            Admin Panel
                        </p>

                    </div>

                </div>

                {/* Navigation */}

                <nav className="p-4 space-y-2">

                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>🏠</span>
                        <span>Home</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>📦</span>
                        <span>Orders</span>
                    </Link>

                    <Link
                        href="/admin/inventory"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>📋</span>
                        <span>Inventory</span>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>📌</span>
                        <span>Categories</span>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>🛍️</span>
                        <span>Products</span>
                    </Link>

                    <Link
                        href="/admin/payments"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>💳</span>
                        <span>Payments</span>
                    </Link>

                    <Link
                        href="/admin/business"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        <span>📊</span>
                        <span>Business Dashboard</span>
                    </Link>

                    {/* MAIN ADMIN ONLY */}

                    {admin.role === "MAIN_ADMIN" && (
                        <Link
                            href="/admin/admins"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition"
                        >
                            <span>👥</span>
                            <span>Admin Management</span>
                        </Link>
                    )}

                </nav>

                {/* Bottom */}

                <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-800">

                    <p className="text-xs text-gray-500">
                        RT18 Admin
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                        Manage your store
                    </p>

                    <AdminLogout />

                </div>

            </aside>

            {/* MAIN CONTENT */}

            <div className="ml-64 flex-1 min-h-screen">

                <AdminStatusGuard />

                {/* TOP BAR */}

                <header className="h-20 bg-white border-b flex items-center justify-between px-8">

                    <div>

                        <h2 className="text-xl font-bold text-gray-900">
                            RT18 Admin
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage your ecommerce business
                        </p>

                    </div>

                    <div className="flex items-center gap-3">

                        <div className="text-right">

                            <p className="text-sm font-semibold text-gray-900">
                                {admin.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                {admin.role === "MAIN_ADMIN"
                                    ? "Main Admin"
                                    : "Admin"}
                            </p>

                        </div>

                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                            {admin.name?.charAt(0).toUpperCase()}
                        </div>

                    </div>

                </header>

                {/* PAGE */}

                <div className="p-8">
                    {children}
                </div>

            </div>

        </div>
    );
}