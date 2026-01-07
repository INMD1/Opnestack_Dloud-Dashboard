"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "light";
    children: React.ReactNode;
    hover?: boolean;
}

/**
 * 글래스모피즘 효과가 적용된 카드 컴포넌트
 * 반투명 배경과 backdrop blur 효과로 모던한 느낌을 제공합니다.
 */
export function GlassCard({
    variant = "default",
    children,
    className = "",
    hover = false,
    ...props
}: GlassCardProps) {
    const variantClass = variant === "default" ? "glass" : "glass-light";
    const hoverClass = hover ? "hover-lift" : "";

    return (
        <div
            className={cn(
                "rounded-lg p-6",
                variantClass,
                hoverClass,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
