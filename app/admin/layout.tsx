import AdminLogout from "./AdminLogout";
import AdminStatusGuard from "./AdminStatusGuard";
import AdminMobileMenu from "./AdminMobileMenu";
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
        <div className="min-h-screen bg-gray-100 lg:flex">

            {/* SIDEBAR */}

            <aside className="relative w-full bg-gray-950 text-white lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:min-h-screen lg:w-64">

                {/* Logo */}

                <div className="flex h-20 items-center border-b border-gray-800 px-4 sm:px-6">

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

                <AdminMobileMenu>

                    {/* Navigation */}

                    <nav className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:block lg:space-y-2 lg:p-4">

                    <Link
                        href="/admin"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>🏠</span>
                        <span>Home</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>📦</span>
                        <span>Orders</span>
                    </Link>

                    <Link
                        href="/admin/inventory"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>📋</span>
                        <span>Inventory</span>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>📌</span>
                        <span>Categories</span>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>🛍️</span>
                        <span>Products</span>
                    </Link>

                    <Link
                        href="/admin/payments"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>💳</span>
                        <span>Payments</span>
                    </Link>

                    <Link
                        href="/admin/business"
                        className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                    >
                        <span>📊</span>
                        <span>Business Dashboard</span>
                    </Link>

                    {/* MAIN ADMIN ONLY */}

                    {admin.role === "MAIN_ADMIN" && (
                        <Link
                            href="/admin/admins"
                            className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-3 text-sm transition hover:bg-gray-800 sm:gap-3 sm:px-4 sm:text-base"
                        >
                            <span>👥</span>
                            <span>Admin Management</span>
                        </Link>
                    )}

                    </nav>

                    {/* Bottom */}

                    <div className="border-t border-gray-800 p-4 sm:p-5 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">

                    <p className="text-xs text-gray-500">
                        RT18 Admin
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                        Manage your store
                    </p>

                    <AdminLogout />

                    </div>

                </AdminMobileMenu>

            </aside>

            {/* MAIN CONTENT */}

            <div className="min-h-screen min-w-0 flex-1 lg:ml-64">

                <AdminStatusGuard />

                {/* TOP BAR */}

                <header className="flex min-h-20 flex-col items-start justify-center gap-3 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

                    <div>

                        <h2 className="text-xl font-bold text-gray-900">
                            RT18 Admin
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage your ecommerce business
                        </p>

                    </div>

                    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">

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

                <div className="min-w-0 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>

            </div>

        </div>
    );
}