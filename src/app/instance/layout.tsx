"use client";

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
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