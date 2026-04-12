"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Globally intercepts all /api/v1/* fetch calls.
 * When a 401 is returned, signs out and redirects to login.
 */
export default function AuthGuard() {
    const { status } = useSession();
    const isHandling = useRef(false);

    useEffect(() => {
        if (status !== "authenticated") return;

        const originalFetch = window.fetch;

        window.fetch = async function (...args) {
            const response = await originalFetch.apply(this, args);

            if (response.status === 401 && !isHandling.current) {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0] instanceof Request
                        ? args[0].url
                        : String(args[0]);

                if (url.includes("/api/v1/")) {
                    isHandling.current = true;
                    await signOut({ callbackUrl: "/" });
                }
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [status]);

    return null;
}
