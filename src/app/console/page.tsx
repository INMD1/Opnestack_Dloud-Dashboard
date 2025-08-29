"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  console.log(session);

  if (status === "loading") return <p>Loading...</p>;

  async function handlelogut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      signOut({ callbackUrl: "/auth/login" });
    }
  }

  return (

    <>
      <nav className="flex justify-between p-4 bg-gray-100">
        <p className="font-bold">My Console</p>
        {session ? (
          <div className="flex items-center gap-4">
            <span>{session.user?.name}님 환영합니다!</span>
            <Button
              variant="outline"
              onClick={() => handlelogut()}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        )}
      </nav>
      <div>

      </div>
    </>
  );
}
