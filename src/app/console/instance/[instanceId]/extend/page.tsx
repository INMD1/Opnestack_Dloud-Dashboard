"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

export default function ExtendPage() {
  const params = useParams();
  const instanceId = params.instanceId as string;
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("연장 처리 중...");

  useEffect(() => {
    async function extend() {
      try {
        const res = await fetch(`/api/v1/instances/${instanceId}/extend`, {
          method: "POST",
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.replace(`/auth/login?redirect=/console/instance/${instanceId}/extend`);
            return;
          }
          const err = await res.json();
          throw new Error(err.detail || "연장 처리 중 오류가 발생했습니다.");
        }

        setStatus("success");
        setMessage("인스턴스 사용 기간이 30일 연장되었습니다. 잠시 후 상세 페이지로 이동합니다.");
        toaster.create({
          title: "성공",
          description: "인스턴스 사용 기간이 연장되었습니다.",
          type: "success",
        });

        setTimeout(() => {
          router.replace(`/console/instance/${instanceId}/info`);
        }, 3000);
      } catch (e: unknown) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "연장 실패");
        toaster.create({
          title: "오류",
          description: e instanceof Error ? e.message : "연장에 실패했습니다.",
          type: "error",
        });
      }
    }

    if (instanceId) {
      extend();
    }
  }, [instanceId, router]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">인스턴스 연장 처리</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          )}
          {status === "success" && (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-red-500" />
            </div>
          )}
          <p className="text-center font-medium">{message}</p>
          {status === "error" && (
            <button
              onClick={() => router.replace(`/console/instance/${instanceId}/info`)}
              className="text-blue-500 hover:underline text-sm"
            >
              상세 페이지로 돌아가기
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
