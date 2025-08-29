"use client";

import { signOut } from "next-auth/react";

export async function skylineFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  // 세션 가져오기
  const sessionRes = await fetch("/api/auth/session");
  const session = await sessionRes.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SKYLINE_API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session?.keystone_token}`,
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    // 🔹 토큰 만료 → 로그아웃
    signOut({ callbackUrl: "/auth/login" });
    return null;
  }

  return res.json();
}
