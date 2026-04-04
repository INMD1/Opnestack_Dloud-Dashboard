"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SSOCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleSSO() {
      try {
        // Skyline WebSSO 처리 후 설정된 쿠키로 프로필 조회 (서버 프록시 경유)
        const profileRes = await fetch("/api/auth/sso-profile", {
          credentials: "include",
        });

        if (!profileRes.ok) {
          setErrorMsg("프로필 조회에 실패했습니다. 다시 로그인해주세요.");
          setStatus("error");
          return;
        }

        const profile = await profileRes.json();
        const keystone_token = profile.keystone_token;

        if (!keystone_token) {
          setErrorMsg("인증 토큰을 받지 못했습니다. 다시 시도해주세요.");
          setStatus("error");
          return;
        }

        // 회원가입 의도 확인
        const ssoIntent = localStorage.getItem("sso_intent");
        if (ssoIntent === "register") {
          localStorage.removeItem("sso_intent");
          sessionStorage.setItem(
            "sso_register_profile",
            JSON.stringify({ keystone_token, user: profile.user ?? profile })
          );
          router.push("/auth/sso-register");
          return;
        }

        // NextAuth 세션에 SSO 토큰 등록
        const res = await signIn("sso-token", {
          keystone_token,
          redirect: false,
        });

        if (res?.ok) {
          router.push("/console");
        } else {
          setErrorMsg("세션 생성에 실패했습니다. 관리자에게 문의하세요.");
          setStatus("error");
        }
      } catch (err) {
        console.error("SSO callback error:", err);
        setErrorMsg("SSO 인증 처리 중 오류가 발생했습니다.");
        setStatus("error");
      }
    }

    handleSSO();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4 p-8 glass rounded-2xl max-w-sm w-full mx-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold">로그인 실패</h2>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full gradient-primary text-white"
          >
            로그인 페이지로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-4 p-8 glass rounded-2xl max-w-sm w-full mx-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <h2 className="text-xl font-semibold">학교 계정으로 로그인 중</h2>
        <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
}
