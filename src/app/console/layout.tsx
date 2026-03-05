"use client";

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProfileChecker from "../exten/ProfileChecker";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    const router = useRouter();
    const [buildingInstances, setBuildingInstances] = useState<string[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        const syncBuilding = () => {
            const stored = localStorage.getItem('buildingInstances');
            const names = stored ? (JSON.parse(stored) as string[]) : [];
            setBuildingInstances(names);
        };
        syncBuilding();

        const interval = setInterval(async () => {
            const stored = localStorage.getItem('buildingInstances');
            if (!stored) return;
            const names = JSON.parse(stored) as string[];
            if (names.length === 0) return;

            try {
                const res = await fetch('/api/v1/extension/servers');
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const servers: any[] = data.servers || [];
                const stillBuilding = names.filter((name: string) => {
                    const server = servers.find((s) => s.name === name);
                    return !server || server.status === 'BUILD';
                });
                localStorage.setItem('buildingInstances', JSON.stringify(stillBuilding));
                setBuildingInstances(stillBuilding);
            } catch (e) {
                console.error(e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
                    {buildingInstances.length > 0 && (
                        <div
                            className="flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => router.push(`/console/instance/${encodeURIComponent(buildingInstances[0])}/status`)}
                            title={`생성 중: ${buildingInstances.join(', ')}`}
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>인스턴스 생성 중 ({buildingInstances.length})</span>
                        </div>
                    )}
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