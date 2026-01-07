"use client";

import * as React from "react";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "cyan";
    children: React.ReactNode;
}

/**
 * 그래디언트 텍스트 컴포넌트
 * 텍스트에 아름다운 그래디언트 효과를 적용합니다.
 */
export function GradientText({
    variant = "primary",
    children,
    className = "",
    ...props
}: GradientTextProps) {
    const variantClass = variant === "primary" ? "gradient-text" : "gradient-text-cyan";

    return (
        <span className={`${variantClass} ${className}`} {...props}>
            {children}
        </span>
    );
}
