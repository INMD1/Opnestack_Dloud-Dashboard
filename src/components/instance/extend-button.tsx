"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { CalendarPlus } from "lucide-react";

interface ExtendButtonProps {
  instanceId: string;
  emailStatus: "none" | "sent" | "extended" | "deleted";
  onSuccess?: () => void;
}

export function ExtendButton({
  instanceId,
  emailStatus,
  onSuccess,
}: ExtendButtonProps) {
  const [loading, setLoading] = useState(false);

  // email_status가 'sent'일 때만 강조 표시
  const isUrgent = emailStatus === "sent";

  async function handleExtend() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/instances/${instanceId}/extend`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "연장 요청에 실패했습니다.");
      }

      toaster.create({
        title: "성공",
        description: "인스턴스 사용 기간이 30일 연장되었습니다.",
        type: "success",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (e: unknown) {
      toaster.create({
        title: "오류",
        description: e instanceof Error ? e.message : "연장에 실패했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleExtend}
      disabled={loading}
      variant={isUrgent ? "destructive" : "default"}
      className={
        isUrgent
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }
    >
      <CalendarPlus className="mr-2 h-4 w-4" />
      {loading ? "처리 중..." : "사용 기간 연장 (+30일)"}
    </Button>
  );
}
