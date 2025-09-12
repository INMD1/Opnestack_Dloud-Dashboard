"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileChecker() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.keystone_token) {
      const checkProfile = async () => {
        try {
          const res = await fetch("/api/v1/profile", {
            headers: {
              Authorization: `${session.keystone_token}`,
            },
          });

          if (res.status === 401) {
            await signOut({ callbackUrl: "/auth/login" });
          }
        } catch (err) {
          console.error("Profile check failed:", err);
          await signOut({ callbackUrl: "/auth/login" });
        }
      };

      // 최초 1회 검사
      checkProfile();

      // 5분마다 한번씩 검사
      const interval = setInterval(checkProfile, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session, status, router]);

  return null; // UI 안보여줌
}
