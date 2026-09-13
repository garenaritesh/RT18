"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = { product_id: number; product_name: string; quantity: number; price: number; image_url: string | null };
type Order = {
    id: number; customer_name: string; phone: string; address: string; city: string; pincode: string;
    payment_method: string; payment_status: string; payment_rejection_reason: string | null;
    transaction_id: string | null; payment_proof: string | null; order_status: string;
    cancellation_reason: string | null; total_amount: number; items: OrderItem[]; created_at: string;
};
type Tab = "ALL" | "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const tabs: { key: Tab; title: string; icon: string }[] = [
    { key: "ALL", title: "All Orders", icon: "📦" }, { key: "PLACED", title: "Pending", icon: "⏳" },
    { key: "CONFIRMED", title: "Confirmed", icon: "✓" }, { key: "SHIPPED", title: "Shipped", icon: "🚚" },
    { key: "DELIVERED", title: "Delivered", icon: "✅" }, { key: "CANCELLED", title: "Cancelled", icon: "✕" },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("ALL");
    const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
    const [reason, setReason] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
    const [generatingLabels, setGeneratingLabels] = useState(false);
    const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

    async function loadOrders() {
        try {
            const response = await fetch("/api/orders", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load orders");
            setOrders((data as Order[]).sort((a, b) => {
                if (a.order_status === "CANCELLED" && b.order_status !== "CANCELLED") return 1;
                if (a.order_status !== "CANCELLED" && b.order_status === "CANCELLED") return -1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }));
        } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Failed to load orders", error: true }); }
        finally { setLoading(false); }
    }

    useEffect(() => { void loadOrders(); }, []);

    async function updateStatus(id: number, status: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED", cancellationReason?: string) {
        if (busyId !== null) return;
        setBusyId(id); setMessage(null);
        try {
            const response = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, ...(cancellationReason ? { cancellationReason } : {}) }) });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Order update failed");
            setOrders((current) => current.map((order) => order.id === id ? { ...order, ...data.order } : order));
            setSelectedOrderIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
            setCancelOrderId(null); setReason(""); setMessage({ text: status === "CONFIRMED" ? "Order accepted." : status === "CANCELLED" ? "Order declined." : `Order marked ${status.toLowerCase()}.` });
        } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Order update failed", error: true }); }
        finally { setBusyId(null); }
    }

    function toggleOrderSelection(id: number) {
        setSelectedOrderIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleSelectAll(checked: boolean, confirmedOrders: Order[]) {
        setSelectedOrderIds(checked ? new Set(confirmedOrders.map((order) => order.id)) : new Set());
    }

    async function generateBulkLabels() {
        if (generatingLabels || selectedOrderIds.size === 0) return;
        setGeneratingLabels(true);
        setMessage(null);
        try {
            const response = await fetch("/api/admin/shipping-labels/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderIds: Array.from(selectedOrderIds) }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || "Failed to generate shipping labels");
            }
            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "RT18-Shipping-Labels.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
            setMessage({ text: `${selectedOrderIds.size} shipping label${selectedOrderIds.size === 1 ? "" : "s"} generated successfully.` });
        } catch (error) {
            setMessage({ text: error instanceof Error ? error.message : "Failed to generate shipping labels", error: true });
        } finally {
            setGeneratingLabels(false);
        }
    }

    const counts = useMemo(() => ({
        ALL: orders.length, PLACED: orders.filter((o) => o.order_status === "PLACED").length,
        CONFIRMED: orders.filter((o) => o.order_status === "CONFIRMED").length,
        SHIPPED: orders.filter((o) => o.order_status === "SHIPPED").length,
        DELIVERED: orders.filter((o) => o.order_status === "DELIVERED").length,
        CANCELLED: orders.filter((o) => o.order_status === "CANCELLED").length,
    }), [orders]);
    const visibleOrders = activeTab === "ALL" ? orders : orders.filter((order) => order.order_status === activeTab);

    return <main className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div><h1 className="text-3xl font-bold text-gray-900">Orders</h1><p className="text-gray-500 mt-1">Manage and track all customer orders.</p></div>
            <button onClick={() => { setLoading(true); void loadOrders(); }} disabled={loading} className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-60">{loading ? "Refreshing..." : "Refresh Orders"}</button>
        </div>
        {message && <div role="status" className={`mb-5 rounded-xl px-4 py-3 ${message.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message.text}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {tabs.map(({ key, ...tab }) => <StatCard key={key} {...tab} value={counts[key]} active={activeTab === key} onClick={() => setActiveTab(key)} />)}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{tabs.find((tab) => tab.key === activeTab)?.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Latest orders are shown first.</p>
                {activeTab === "CONFIRMED" && visibleOrders.length > 0 && <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                        <input type="checkbox" checked={visibleOrders.every((order) => selectedOrderIds.has(order.id))} onChange={(event) => toggleSelectAll(event.target.checked, visibleOrders)} disabled={generatingLabels} className="h-5 w-5 accent-black" />
                        Select All
                    </label>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{selectedOrderIds.size} orders selected</span>
                        <button onClick={() => void generateBulkLabels()} disabled={selectedOrderIds.size === 0 || generatingLabels} className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50">{generatingLabels ? "Generating Labels..." : "Generate Labels"}</button>
                    </div>
                </div>}
            </div>
            {loading ? <div className="p-10 text-center text-gray-500">Loading orders...</div> : visibleOrders.length === 0 ? <div className="p-10 text-center text-gray-500">No orders found.</div> : <div className="divide-y divide-gray-200">{visibleOrders.map((order) => <OrderCard key={order.id} order={order} busy={busyId === order.id || generatingLabels} selectable={activeTab === "CONFIRMED"} selected={selectedOrderIds.has(order.id)} onToggleSelection={() => toggleOrderSelection(order.id)} onStatus={updateStatus} onCancel={() => { setCancelOrderId(order.id); setReason(""); }} />)}</div>}
        </div>
        {cancelOrderId !== null && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5"><div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Decline Order</h2><p className="text-sm text-gray-500 mt-2">A reason is required and will be saved with the order.</p>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Enter decline reason" className="w-full mt-5 border border-gray-300 rounded-xl p-3 text-gray-900" rows={4} />
            <div className="flex gap-3 mt-5"><button disabled={!reason.trim() || busyId !== null} onClick={() => void updateStatus(cancelOrderId, "CANCELLED", reason.trim())} className="flex-1 bg-red-600 text-white py-3 rounded-xl disabled:opacity-50">{busyId !== null ? "Declining..." : "Decline Order"}</button><button disabled={busyId !== null} onClick={() => setCancelOrderId(null)} className="flex-1 border border-gray-300 py-3 rounded-xl text-gray-700">Keep Order</button></div>
        </div></div>}
    </main>;
}

function OrderCard({ order, busy, selectable, selected, onToggleSelection, onStatus, onCancel }: { order: Order; busy: boolean; selectable: boolean; selected: boolean; onToggleSelection: () => void; onStatus: (id: number, status: "CONFIRMED" | "SHIPPED" | "DELIVERED") => void; onCancel: () => void }) {
    return <div className="p-6 hover:bg-gray-50 transition"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div><div className="flex items-center gap-3">{selectable && <input type="checkbox" aria-label={`Select order ${order.id}`} checked={selected} onChange={onToggleSelection} disabled={busy} className="h-5 w-5 accent-black" />}<h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3><StatusBadge status={order.order_status} /></div><p className="text-sm text-gray-500 mt-2">{new Date(order.created_at).toLocaleString()}</p></div>
        <div className="text-left lg:text-right"><p className="text-2xl font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</p><p className="text-sm text-gray-500 mt-1">{order.payment_method === "COD" ? "Cash on Delivery" : "Online Payment"}</p></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"><div className="bg-gray-50 rounded-xl p-5"><p className="text-xs font-semibold text-gray-500 uppercase">Customer</p><p className="font-bold text-gray-900 mt-2">{order.customer_name}</p><div className="flex items-center gap-2 mt-1"><p className="text-gray-700">{order.phone}</p>{order.order_status === "PLACED" && <a href={`https://wa.me/${getWhatsAppNumber(order.phone)}?text=${encodeURIComponent(getWhatsAppMessage(order))}`} target="_blank" rel="noopener noreferrer" aria-label={`Open WhatsApp chat with ${order.customer_name}`} title="Chat on WhatsApp" className="inline-flex items-center justify-center text-[#25D366] hover:text-[#128C7E] transition"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.59 5.97L.1 24l6.3-1.65a11.86 11.86 0 0 0 5.67 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.18-1.24-6.17-3.44-8.43ZM12.08 21.75h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.74.98 1-3.65-.23-.37a9.83 9.83 0 0 1-1.51-5.25C2.21 6.44 6.64 2.01 12.08 2.01c2.64 0 5.12 1.03 6.98 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.44-4.43 9.85-9.87 9.85Zm5.41-7.38c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.53.07-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.14 3.27 5.18 4.59.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" /></svg></a>}</div><p className="text-gray-600 mt-2">{order.address}, {order.city} - {order.pincode}</p></div>
        <div className="bg-gray-50 rounded-xl p-5"><p className="text-xs font-semibold text-gray-500 uppercase">Order Actions</p><div className="space-y-3 mt-3">
            {order.order_status === "PLACED" && <><button disabled={busy} onClick={() => onStatus(order.id, "CONFIRMED")} className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-60">{busy ? "Updating..." : "Accept Order"}</button><button disabled={busy} onClick={onCancel} className="w-full border border-red-600 text-red-600 py-3 rounded-xl disabled:opacity-60">Decline Order</button></>}
            {order.order_status === "CONFIRMED" && <><button disabled={busy} onClick={() => window.open(`/admin/orders/label/${order.id}`, "_blank")} className="w-full bg-black text-white py-3 rounded-xl">Generate Shipping Label</button><button disabled={busy} onClick={() => onStatus(order.id, "SHIPPED")} className="w-full bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-60">{busy ? "Updating..." : "Ship Order"}</button></>}
            {order.order_status === "SHIPPED" && <><button onClick={() => window.open(`/admin/orders/label/${order.id}`, "_blank")} className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl">View Shipping Label</button><button disabled={busy} onClick={() => onStatus(order.id, "DELIVERED")} className="w-full bg-green-600 text-white py-3 rounded-xl disabled:opacity-60">{busy ? "Updating..." : "Mark as Delivered"}</button></>}
            {order.order_status === "DELIVERED" && <p className="text-sm text-gray-600">Order delivered. No further actions available.</p>}
            {order.order_status === "CANCELLED" && <p className="text-sm text-red-700">Cancelled: {order.cancellation_reason || "No reason provided"}</p>}
        </div></div></div>
    <PaymentDetails order={order} /><div className="mt-6"><p className="text-sm font-bold text-gray-900 mb-3">Ordered Products</p><div className="space-y-3">{order.items.map((item, index) => <div key={`${order.id}-${item.product_id}-${index}`} className="flex items-center gap-4 border border-gray-200 rounded-xl p-3">{item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">📦</div>}<div className="flex-1"><p className="font-semibold text-gray-900">{item.product_name}</p><p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p></div><p className="font-bold text-gray-900">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p></div>)}</div></div></div>;
}

function getWhatsAppNumber(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `91${digits}` : digits;
}

function getWhatsAppMessage(order: Order) {
    const products = order.items.map((item) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        return `Product name :- ${item.product_name}\nQuantity :- ${item.quantity}\nPrice :- ₹${itemTotal.toFixed(2)}`;
    }).join("\n\n");
    const paymentMethod = order.payment_method === "COD" ? "Cash on Delivery" : order.payment_method;

    return `Hi ${order.customer_name}! 👋

Thank you for placing your order with RT18 ❤️

Your order has been received and we would like to confirm it before processing.

Order No :- #${order.id}

Order Details:
${products}

Total Amount :- ₹${Number(order.total_amount).toFixed(2)}
Payment Method :- ${paymentMethod}

Please reply "YES" to confirm your order.

Thank you for shopping with RT18! ❤️`;
}

function PaymentDetails({ order }: { order: Order }) {
    const [busy, setBusy] = useState(false);
    if (order.payment_method !== "PREPAID" && order.payment_method !== "RAZORPAY") return null;
    async function paymentAction(action: "verify" | "reject") {
        if (busy) return; let reason = "";
        if (action === "reject") { reason = window.prompt("Enter payment rejection reason:")?.trim() || ""; if (!reason) return; }
        if (!window.confirm(action === "verify" ? "Have you verified the payment screenshot and Transaction ID?" : "Reject this payment?")) return;
        setBusy(true);
        try { const response = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "verify" ? { id: order.id, paymentStatus: "PAID" } : { id: order.id, rejectPayment: true, reason }) }); if (!response.ok) throw new Error((await response.json()).message || "Payment update failed"); window.location.reload(); } catch (error) { alert(error instanceof Error ? error.message : "Payment update failed"); setBusy(false); }
    }
    return <div className="mt-6 bg-gray-50 rounded-xl p-5"><p className="text-xs font-semibold text-gray-500 uppercase">Payment Details</p><p className="font-semibold text-gray-900 mt-2">Status: {order.payment_status}</p>{order.payment_status !== "PAID" && order.payment_status !== "REJECTED" && <div className="flex flex-col sm:flex-row gap-3 mt-4"><button disabled={busy} onClick={() => void paymentAction("verify")} className="flex-1 bg-green-600 text-white py-3 rounded-xl disabled:opacity-60">✓ Verify Payment</button><button disabled={busy} onClick={() => void paymentAction("reject")} className="flex-1 border border-red-600 text-red-600 py-3 rounded-xl disabled:opacity-60">✕ Reject Payment</button></div>}<p className="text-sm text-gray-600 mt-3">Transaction ID / UTR: <span className="font-semibold break-all">{order.transaction_id || "Not provided"}</span></p>{order.payment_proof && <a href={order.payment_proof} target="_blank" rel="noopener noreferrer" className="inline-block mt-3"><img src={order.payment_proof} alt="Payment Proof" className="w-40 h-40 object-cover rounded-xl border border-gray-200" /></a>}</div>;
}

function StatCard({ title, value, icon, active, onClick }: { title: string; value: number; icon: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} aria-pressed={active} className={`text-left bg-white border rounded-2xl p-5 shadow-sm transition ${active ? "border-black ring-2 ring-black" : "border-gray-200 hover:border-gray-400"}`}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-900 mt-2">{value}</p></div><div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl">{icon}</div></div></button>; }
function StatusBadge({ status }: { status: string }) { const styles: Record<string, string> = { PLACED: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700", SHIPPED: "bg-indigo-100 text-indigo-700", DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" }; return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`}>{status === "PLACED" ? "PENDING" : status}</span>; }
