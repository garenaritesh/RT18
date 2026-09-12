"use client";

import { useEffect, useState } from "react";

type SupportRequest = {
    id: number;
    user_id: number | null;
    requester_name: string | null;
    email: string | null;
    phone: string | null;
    status: "PENDING" | "RESOLVED" | "CLOSED";
    admin_note: string | null;
    created_at: string;
    resolved_at: string | null;
    user_name: string | null;
    user_email: string | null;
    user_phone: string | null;
};

export default function SupportPage() {
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);
    const [temporaryPasswords, setTemporaryPasswords] = useState<Record<number, string>>({});

    async function loadRequests() {
        try {
            const response = await fetch("/api/admin/support");
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load support requests");
            }

            setRequests(data.requests);
            setError("");
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load support requests");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadRequests();
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    async function markResolved(requestId: number) {
        const note = window.prompt("Optional note for this request:") || "";
        setSavingId(requestId);
        setError("");

        try {
            const response = await fetch("/api/admin/support", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: requestId, status: "RESOLVED", note }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update request");
            }

            setRequests((current) => current.map((item) => (
                item.id === requestId
                    ? { ...item, status: "RESOLVED", admin_note: note, resolved_at: new Date().toISOString() }
                    : item
            )));
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Failed to update request");
        } finally {
            setSavingId(null);
        }
    }

    async function resetPassword(requestId: number) {
        setSavingId(requestId);
        setError("");

        try {
            const response = await fetch("/api/admin/support", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: requestId, action: "RESET_PASSWORD" }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to reset password");
            }

            setTemporaryPasswords((current) => ({
                ...current,
                [requestId]: data.temporaryPassword,
            }));
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : "Failed to reset password");
        } finally {
            setSavingId(null);
        }
    }

    const pendingCount = requests.filter((request) => request.status === "PENDING").length;

    return (
        <main className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Support Requests</h1>
                    <p className="mt-1 text-gray-500">Review forgot-password requests and contact customers after resetting their password.</p>
                </div>
                <button
                    type="button"
                    onClick={() => void loadRequests()}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-black hover:text-black"
                >
                    Refresh
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Pending requests</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "-" : pendingCount}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total requests</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "-" : requests.length}</p>
                </div>
            </div>

            {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Forgot-password requests</h2>
                </div>

                {loading && <p className="px-5 py-8 text-center text-gray-500">Loading requests...</p>}
                {!loading && requests.length === 0 && <p className="px-5 py-8 text-center text-gray-500">No support requests yet.</p>}

                {!loading && requests.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Customer</th>
                                    <th className="px-5 py-3 font-semibold">Contact</th>
                                    <th className="px-5 py-3 font-semibold">Requested</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((request) => (
                                    <tr key={request.id} className="text-gray-700">
                                        <td className="px-5 py-4 align-top">
                                            <p className="font-semibold text-gray-900">{request.requester_name || request.user_name || "Name not provided"}</p>
                                            {request.user_id && <p className="mt-1 text-xs text-green-700">Registered user #{request.user_id}</p>}
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            {request.email && <p>{request.email}</p>}
                                            {request.phone && <p className="mt-1">{request.phone}</p>}
                                            {!request.email && !request.phone && <span>Not provided</span>}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 align-top">{new Date(request.created_at).toLocaleString()}</td>
                                        <td className="px-5 py-4 align-top">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                                                {request.status}
                                            </span>
                                            {request.admin_note && <p className="mt-2 max-w-xs text-xs text-gray-500">{request.admin_note}</p>}
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            {request.status === "PENDING" && (
                                                <div className="space-y-2">
                                                    {!temporaryPasswords[request.id] && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void resetPassword(request.id)}
                                                            disabled={savingId === request.id || !request.user_id}
                                                            className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                                        >
                                                            {savingId === request.id ? "Resetting..." : "Reset password"}
                                                        </button>
                                                    )}
                                                    {temporaryPasswords[request.id] && (
                                                        <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-900">
                                                            Temporary password: <strong>{temporaryPasswords[request.id]}</strong>
                                                        </p>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => void markResolved(request.id)}
                                                        disabled={savingId === request.id}
                                                        className="whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50"
                                                    >
                                                        Mark resolved
                                                    </button>
                                                </div>
                                            )}
                                            {request.status !== "PENDING" && <span className="text-xs text-gray-500">Completed</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
