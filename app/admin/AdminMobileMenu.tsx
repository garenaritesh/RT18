"use client";

import { ReactNode, useState } from "react";

type AdminMobileMenuProps = {
    children: ReactNode;
};

export default function AdminMobileMenu({ children }: AdminMobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label={open ? "Close admin menu" : "Open admin menu"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="absolute right-4 top-6 z-10 rounded-lg border border-gray-700 px-3 py-2 text-xl leading-none text-white hover:bg-gray-800 lg:hidden"
            >
                {open ? "✕" : "☰"}
            </button>

            <div className={`${open ? "block" : "hidden"} lg:block`}>
                {children}
            </div>
        </>
    );
}
