"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Mail } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error" | "expired" | "already_verified";

function VerifyPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [message, setMessage] = useState("");
    const [userInfo, setUserInfo] = useState<{ user_id?: string; email?: string }>({});

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("인증 토큰이 제공되지 않았습니다.");
            return;
        }

        // 토큰 검증 API 호출
        verifyToken(token);
    }, [searchParams]);

    const verifyToken = async (token: string) => {
        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.alreadyVerified) {
                    setStatus("already_verified");
                    setMessage(data.message);
                } else {
                    setStatus("success");
                    setMessage(data.message);
                    setUserInfo({
                        user_id: data.user_id,
                        email: data.email,
                    });
                }
            } else if (response.status === 410) {
                setStatus("expired");
                setMessage(data.error);
            } else {
                setStatus("error");
                setMessage(data.error || "인증에 실패했습니다.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus("error");
            setMessage("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md mx-4">
                {/* 카드 */}
                <div className="glass rounded-2xl shadow-xl overflow-hidden border border-primary/10">
                    {/* 헤더 */}
                    <div className="bg-gradient-to-r from-primary/80 to-accent/80 px-8 py-6 text-center">
                        <h1 className="text-2xl font-bold text-white">D-Cloud Infra</h1>
                        <p className="text-white/90 text-sm mt-1">학생 계정 인증</p>
                    </div>

                    {/* 본문 */}
                    <div className="px-8 py-10">
                        {/* 로딩 상태 */}
                        {status === "loading" && (
                            <div className="text-center">
                                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                                <h2 className="text-xl font-semibold mb-2">인증 처리 중...</h2>
                                <p className="text-muted-foreground text-sm">
                                    잠시만 기다려주세요.
                                </p>
                            </div>
                        )}

                        {/* 성공 상태 */}
                        {status === "success" && (
                            <div className="text-center">
                                <div className="mb-4 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-20 w-20 bg-green-500/20 rounded-full animate-ping" />
                                    </div>
                                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 relative z-10" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2 text-green-600">
                                    인증 완료!
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {message}
                                </p>

                                {/* 사용자 정보 */}
                                {userInfo.user_id && (
                                    <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-muted-foreground">학번:</span>
                                            <span className="text-sm font-semibold">{userInfo.user_id}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-t border-border/50">
                                            <span className="text-sm text-muted-foreground">이메일:</span>
                                            <span className="text-sm font-semibold">{userInfo.email}</span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full gradient-primary text-white hover-lift"
                                    onClick={() => router.push("/auth/login")}
                                >
                                    로그인하러 가기
                                </Button>
                            </div>
                        )}

                        {/* 이미 인증됨 상태 */}
                        {status === "already_verified" && (
                            <div className="text-center">
                                <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                                <h2 className="text-xl font-semibold mb-2 text-yellow-600">
                                    이미 인증된 계정
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {message}
                                </p>
                                <Button
                                    className="w-full gradient-primary text-white hover-lift"
                                    onClick={() => router.push("/auth/login")}
                                >
                                    로그인하러 가기
                                </Button>
                            </div>
                        )}

                        {/* 만료 상태 */}
                        {status === "expired" && (
                            <div className="text-center">
                                <Mail className="h-16 w-16 mx-auto text-orange-500 mb-4" />
                                <h2 className="text-xl font-semibold mb-2 text-orange-600">
                                    토큰 만료
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full gradient-primary text-white hover-lift"
                                        onClick={() => router.push("/auth/register")}
                                    >
                                        다시 인증 요청하기
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push("/auth/login")}
                                    >
                                        로그인 페이지로
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 에러 상태 */}
                        {status === "error" && (
                            <div className="text-center">
                                <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                                <h2 className="text-xl font-semibold mb-2 text-red-600">
                                    인증 실패
                                </h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        className="w-full gradient-primary text-white hover-lift"
                                        onClick={() => router.push("/auth/register")}
                                    >
                                        다시 시도하기
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.push("/auth/login")}
                                    >
                                        로그인 페이지로
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 푸터 */}
                    <div className="bg-muted/30 px-8 py-4 text-center border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            문의사항이 있으시면{" "}
                            <Link href="mailto:support@d-cloud.com" className="text-primary hover:underline">
                                dcloudasw@gmail.com
                            </Link>
                            으로 연락주세요.
                        </p>
                    </div>
                </div>

                {/* 하단 안내 */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        <Link href="/" className="text-primary hover:underline">
                            홈으로 돌아가기
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}
