"use client";

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProfileChecker from "../exten/ProfileChecker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";


export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
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

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout API failed:", err);
        } finally {
            signOut({ callbackUrl: "/" });
        }
    }

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center w-screen h-screen bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <ProfileChecker />
            <AppSidebar />
            <div className="relative flex flex-col flex-1 w-full min-h-screen bg-background overflow-hidden transition-colors duration-300">
                {/* Global Top Header */}
                <header className="sticky top-0 z-40 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse"></span>
                            System Operational
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {buildingInstances.length > 0 && (
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black cursor-pointer hover:bg-primary/20 transition-all shadow-sm"
                                onClick={() => router.push(`/console/instance/${encodeURIComponent(buildingInstances[0])}/status`)}
                                title={`생성 중: ${buildingInstances.join(', ')}`}
                            >
                                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                                <span className="tracking-tighter uppercase">BUILDING ({buildingInstances.length})</span>
                            </div>
                        )}
                        
                        {session ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end mr-1">
                                    <span className="text-xs font-bold text-foreground">{session.user?.name}</span>
                                    <span className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-tighter">Verified Identity</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLogout()}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all gap-2 px-3 border border-border rounded-xl"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline font-bold uppercase tracking-widest text-[10px]">Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <Link href="/auth/login">
                                <Button size="sm" className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg">
                                    Login Access
                                </Button>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
