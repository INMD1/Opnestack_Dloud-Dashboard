"use client";

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProfileChecker from "../exten/ProfileChecker";


export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    async function handlelogut() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout API failed:", err);
        } finally {
            signOut({ callbackUrl: "/auth/login" });
        }
    }
    //어디다 설치할지 고민중
    {/* <SidebarTrigger /> */ }
    if (status === "loading") return <p>Loading...</p>;

    return (
        <SidebarProvider >
            <ProfileChecker />
            <AppSidebar />
            <div className=" grid-flow-col w-screen h-screen">
                <div className="pl-10 pr-10 pt-10 flex justify-end items-center ">
                    <div>
                        {session ? (
                            <div className="flex items-center gap-4">
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
                    </div>
                </div>
                <div className="items-start">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    )
}