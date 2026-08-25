"use client";

import { useEffect, useState } from "react";

export default function AdminStatusGuard() {
    const [deactivated, setDeactivated] = useState(false);

    useEffect(() => {
        async function checkStatus() {
            try {
                const response = await fetch("/api/admin/status");
                const data = await response.json();

                if (data.deactivated) {
                    setDeactivated(true);
                }
            } catch (error) {
                console.error("Admin status check error:", error);
            }
        }

        checkStatus();

        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!deactivated) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">

                <div className="text-4xl mb-4">
                    🔒
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                    Account Deactivated
                </h2>

                <p className="text-gray-500 mt-3">
                    Your admin account has been deactivated.
                </p>

                <p className="text-gray-700 font-semibold mt-2">
                    Please contact the Main Admin.
                </p>

            </div>
        </div>
    );
}