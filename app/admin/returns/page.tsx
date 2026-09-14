"use client";

import { useEffect, useState } from "react";

type ReturnRequest = {
    id: number;
    order_id: number;
    product_id: number;
    status: string;
    requested_at: string;
    customer_name: string;
    phone: string;
    email: string;
    product_name: string;
    image_url: string | null;
};

export default function ReturnsPage() {
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);

    async function loadRequests() {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/returns", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Failed to load return requests");
            setRequests(data.requests || []);
            setError("");
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Failed to load return requests");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => void loadRequests(), 0);
        return () => window.clearTimeout(timer);
    }, []);

    const pendingCount = requests.filter((request) => request.status === "PENDING").length;

    async function updateRequest(id: number, status: "ACCEPTED" | "DECLINED") {
        setSavingId(id);
        setError("");
        try {
            const response = await fetch("/api/admin/returns", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Failed to update return request");
            setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Failed to update return request");
        } finally {
            setSavingId(null);
        }
    }

    return (
        <main className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Return Requests</h1>
                    <p className="mt-1 text-gray-500">See which customers have requested product returns.</p>
                </div>
                <button type="button" onClick={() => void loadRequests()} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-black hover:text-black">
                    Refresh
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Pending returns</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "-" : pendingCount}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total return requests</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? "-" : requests.length}</p>
                </div>
            </div>

            {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Customer return requests</h2>
                </div>
                {loading && <p className="px-5 py-8 text-center text-gray-500">Loading return requests...</p>}
                {!loading && requests.length === 0 && <p className="px-5 py-8 text-center text-gray-500">No return requests yet.</p>}
                {!loading && requests.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Customer</th>
                                    <th className="px-5 py-3 font-semibold">Order</th>
                                    <th className="px-5 py-3 font-semibold">Product</th>
                                    <th className="px-5 py-3 font-semibold">Requested</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((request) => (
                                    <tr key={request.id} className="text-gray-700">
                                        <td className="px-5 py-4 align-top">
                                            <p className="font-semibold text-gray-900">{request.customer_name}</p>
                                            <p className="mt-1 text-xs">{request.email}</p>
                                            <div className="mt-1 flex items-center gap-2 text-xs">
                                                <span>{request.phone}</span>
                                                {request.phone && (
                                                    <a
                                                        href={`https://wa.me/${getWhatsAppNumber(request.phone)}?text=${encodeURIComponent(getReturnWhatsAppMessage(request))}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`Message ${request.customer_name} on WhatsApp about return request`}
                                                        title="Message customer on WhatsApp"
                                                        className="inline-flex items-center justify-center text-[#25D366] transition hover:text-[#128C7E]"
                                                    >
                                                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                                            <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.59 5.97L.1 24l6.3-1.65a11.86 11.86 0 0 0 5.67 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.18-1.24-6.17-3.44-8.43ZM12.08 21.75h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.74.98 1-3.65-.23-.37a9.83 9.83 0 0 1-1.51-5.25C2.21 6.44 6.64 2.01 12.08 2.01c2.64 0 5.12 1.03 6.98 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.44-4.43 9.85-9.87 9.85Zm5.41-7.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.53.07-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.14 3.27 5.18 4.59.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 align-top font-semibold text-gray-900">#{request.order_id}</td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex min-w-48 items-center gap-3">
                                                {request.image_url ? <img src={request.image_url} alt={request.product_name} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">📦</div>}
                                                <span className="font-medium text-gray-900">{request.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 align-top">{formatIndianDateTime(request.requested_at)}</td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex flex-col items-start gap-2">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : request.status === "ACCEPTED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{request.status}</span>
                                                {request.status === "PENDING" && <div className="flex gap-2">
                                                    <button type="button" onClick={() => void updateRequest(request.id, "ACCEPTED")} disabled={savingId === request.id} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Accept</button>
                                                    <button type="button" onClick={() => void updateRequest(request.id, "DECLINED")} disabled={savingId === request.id} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">Decline</button>
                                                </div>}
                                            </div>
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

function formatIndianDateTime(timestamp: string) {
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(timestamp)).replace(/ am| pm/i, (period) => ` ${period.trim().toUpperCase()}`);
}

function getWhatsAppNumber(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `91${digits}` : digits;
}

function getReturnWhatsAppMessage(request: ReturnRequest) {
    return `Hi ${request.customer_name}, regarding your return request for Order #${request.order_id} (${request.product_name}). As per our return policy, please share a 360-degree video of the product here. After reviewing the video, we will proceed with your return request. Thank you.`;
}