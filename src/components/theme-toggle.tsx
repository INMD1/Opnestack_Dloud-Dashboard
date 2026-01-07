"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * 다크모드/라이트모드 전환 토글 버튼
 * next-themes를 사용하여 테마를 관리합니다.
 */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // 클라이언트 사이드에서만 렌더링되도록 처리
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <IconSun className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover-lift"
        >
            {theme === "dark" ? (
                <IconSun className="h-5 w-5" />
            ) : (
                <IconMoon className="h-5 w-5" />
            )}
            <span className="sr-only">테마 전환</span>
        </Button>
    );
}
