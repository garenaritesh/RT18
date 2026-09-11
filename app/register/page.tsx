"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        const redirect = typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
            ? `?next=${encodeURIComponent(next)}`
            : "";

        router.replace(`/login${redirect}`);
    }, [router]);

    return null;
}