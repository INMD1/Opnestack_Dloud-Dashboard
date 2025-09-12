"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileChecker from "../exten/ProfileChecker";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider >
            <ProfileChecker />
            <AppSidebar />
            <div className=" grid-flow-col w-screen h-screen">
                <div className="items-start">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    )
}