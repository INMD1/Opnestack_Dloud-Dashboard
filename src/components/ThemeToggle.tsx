"use client";

import * as React from "react";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // 클라이언트 사이드에서만 렌더링되도록 (하이드레이션 오류 방지)
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="h-9 w-9">
                <IconSun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border/50 hover:bg-accent transition-all duration-200"
                >
                    {theme === "light" && <IconSun className="h-4 w-4" />}
                    {theme === "dark" && <IconMoon className="h-4 w-4" />}
                    {theme === "system" && <IconDeviceDesktop className="h-4 w-4" />}
                    <span className="sr-only">테마 변경</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer"
                >
                    <IconSun className="mr-2 h-4 w-4" />
                    <span>라이트</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer"
                >
                    <IconMoon className="mr-2 h-4 w-4" />
                    <span>다크</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer"
                >
                    <IconDeviceDesktop className="mr-2 h-4 w-4" />
                    <span>시스템</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
