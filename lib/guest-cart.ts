export type GuestCartItem = {
    id: number;
    quantity: number;
};

const GUEST_CART_KEY = "rt18_guest_cart";

function isValidItem(item: unknown): item is GuestCartItem {
    if (!item || typeof item !== "object") {
        return false;
    }

    const candidate = item as Partial<GuestCartItem>;
    return (
        Number.isInteger(candidate.id) &&
        Number.isInteger(candidate.quantity) &&
        Number(candidate.id) > 0 &&
        Number(candidate.quantity) > 0 &&
        Number(candidate.quantity) <= 100
    );
}

export function getGuestCart(): GuestCartItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
        return Array.isArray(stored) ? stored.filter(isValidItem) : [];
    } catch {
        return [];
    }
}

export function saveGuestCart(cart: GuestCartItem[]) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart.filter(isValidItem)));
    window.dispatchEvent(new Event("cartUpdated"));
}

export function addToGuestCart(productId: number, quantity: number) {
    const cart = getGuestCart();
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
        existing.quantity = Math.min(100, existing.quantity + quantity);
    } else {
        cart.push({ id: productId, quantity });
    }

    saveGuestCart(cart);
}

export function removeFromGuestCart(productId: number) {
    saveGuestCart(getGuestCart().filter((item) => item.id !== productId));
}

export function updateGuestCartQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
        removeFromGuestCart(productId);
        return;
    }

    saveGuestCart(
        getGuestCart().map((item) =>
            item.id === productId ? { ...item, quantity: Math.min(100, quantity) } : item
        )
    );
}

export function clearGuestCart() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event("cartUpdated"));
}
