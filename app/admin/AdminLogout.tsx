"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogout() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);

        try {
            const response = await fetch(
                "/api/admin/logout",
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (data.success) {
                router.push("/admin/login");
                router.refresh();
            }
        } catch (error) {
            console.error("Admin logout error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={logout}
            disabled={loading}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition text-left disabled:opacity-50"
        >
            <span>↪️</span>
            <span>
                {loading ? "Logging out..." : "Logout"}
            </span>
        </button>
    );
}