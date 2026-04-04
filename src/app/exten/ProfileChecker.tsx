"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function ProfileChecker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.keystone_token) return;

    const checkProfile = async () => {
      try {
        const res = await fetch("/api/v1/profile");
        if (res.status === 401) {
          await signOut({ callbackUrl: "/" });
        }
      } catch {
        await signOut({ callbackUrl: "/" });
      }
    };

    checkProfile();
    const interval = setInterval(checkProfile, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.keystone_token, status]);

  return null;
}
