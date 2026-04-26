"use client";

import { Badge } from "@/components/ui/badge";
import { LifecycleStatus } from "@/types/lifecycle";

interface LifecycleBadgeProps {
  lifecycle: LifecycleStatus;
}

export function LifecycleBadge({ lifecycle }: LifecycleBadgeProps) {
  const daysLeft = Math.floor(lifecycle.remaining_seconds / 86400);

  if (lifecycle.email_status === "deleted") {
    return (
      <Badge className="bg-red-500 hover:bg-red-600 text-white">삭제됨</Badge>
    );
  }
  if (lifecycle.email_status === "extended") {
    return (
      <Badge className="bg-green-500 hover:bg-green-600 text-white">
        연장됨 (D{daysLeft >= 0 ? "+" : ""}{daysLeft})
      </Badge>
    );
  }
  if (lifecycle.email_status === "sent") {
    return (
      <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
        만료 이메일 발송됨 — 연장 필요
      </Badge>
    );
  }
  if (daysLeft <= 7) {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
        만료 {daysLeft}일 전
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
      운영 중 (D{daysLeft >= 0 ? "+" : ""}{daysLeft})
    </Badge>
  );
}
