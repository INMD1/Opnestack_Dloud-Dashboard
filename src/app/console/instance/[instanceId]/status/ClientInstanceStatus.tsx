"use client";

import { useEffect, useState } from "react";
import { components } from "@/lib/skyline-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, Loader2Icon, AlertCircleIcon, CopyIcon, KeyIcon, UserIcon } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

type Instance = components["schemas"]["ServersResponseBase"];

interface InstanceDetail {
    id: string;
    name: string;
    status: string;
    os_name?: string;
    default_user?: string;
    default_password?: string;
}

export default function ClientInstanceStatus({
    instanceId,
}: {
    instanceId: string;
}) {
    const [instance, setInstance] = useState<Instance | null>(null);
    const [instanceDetail, setInstanceDetail] = useState<InstanceDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // instanceId는 인스턴스 이름으로 전달됨 (백그라운드 생성이므로 UUID가 아직 없음)
                const encodedName = encodeURIComponent(instanceId);
                const res = await fetch(`/api/v1/extension/servers?name=${encodedName}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || "Failed to fetch instance status");
                }
                const data = await res.json();

                if (data.servers && data.servers.length > 0) {
                    // 정확히 같은 이름의 서버 찾기
                    const matchedServer = data.servers.find(
                        (s: Instance) => s.name === instanceId
                    );
                    if (matchedServer) {
                        setInstance(matchedServer);
                        if (matchedServer.status === "ACTIVE" || matchedServer.status === "ERROR") {
                            clearInterval(intervalId);
                        }
                        // ACTIVE가 되면 상세 정보 (비밀번호 포함) 조회
                        if (matchedServer.status === "ACTIVE" && matchedServer.id) {
                            try {
                                const detailRes = await fetch(`/api/v1/instances?instance_id=${matchedServer.id}`);
                                if (detailRes.ok) {
                                    const detail = await detailRes.json();
                                    setInstanceDetail(detail);
                                }
                            } catch (detailErr) {
                                console.warn("인스턴스 상세 조회 실패:", detailErr);
                            }
                        }
                    } else {
                        console.log("Instance not found yet, retrying...");
                    }
                } else {
                    console.log("Instance not found yet, retrying...");
                }
            } catch (_error) {
                console.error("Fetch status error:", _error);
                setError(String(_error));
                clearInterval(intervalId);
            }
        };

        const intervalId = setInterval(fetchStatus, 5000);
        fetchStatus();
        return () => clearInterval(intervalId);
    }, [instanceId]);

    if (error) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg bg-destructive text-destructive-foreground">
                    <CardHeader>
                        <CardTitle>오류 발생</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button className="mt-3" variant="secondary" onClick={() => window.location.href = '/console/instance/view'}>
                            인스턴스 목록으로 이동
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 아직 인스턴스가 조회되지 않음 → 디스크/볼륨 생성 중
    if (!instance) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>서버 제작 시작</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Loader2Icon className="animate-spin" />
                            <AlertTitle>확인해 주세요!</AlertTitle>
                            <AlertDescription>
                                현재 보고있는 페이지는 디스크가 생성되고 있는 중입니다. 이 디스크 생성은 4~30분 정도 소요됩니다.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-3">인스턴스 디스크 생성중...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 인스턴스가 BUILD 상태 → 서버 생성 중
    if (instance.status === "BUILD") {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{instance.name} 서버 생성 중</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Loader2Icon className="animate-spin" />
                            <AlertTitle>서버 생성 진행 중</AlertTitle>
                            <AlertDescription>
                                디스크 생성이 완료되었습니다. 현재 서버를 구성하고 있습니다. 잠시만 기다려 주세요.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-3">상태: {instance.status}</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 인스턴스가 ERROR 상태
    if (instance.status === "ERROR") {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{instance.name} 생성 실패</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertCircleIcon />
                            <AlertTitle>오류 발생</AlertTitle>
                            <AlertDescription>
                                인스턴스 생성 중 오류가 발생했습니다. 관리자에게 문의해 주세요.
                            </AlertDescription>
                        </Alert>
                        <Button className="mt-3" onClick={() => window.location.href = '/console/instance/view'}>
                            인스턴스 목록으로 이동
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 비밀번호 복사 핸들러
    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(field);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    // 인스턴스가 ACTIVE 상태 → 생성 완료
    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{instance.name} 생성 완료</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>생성 완료!</AlertTitle>
                        <AlertDescription>
                            인스턴스가 정상적으로 생성되었습니다.
                        </AlertDescription>
                    </Alert>

                    {/* 접속 정보 카드 */}
                    {instanceDetail && (instanceDetail.default_user || instanceDetail.default_password) && (
                        <div className="mt-4 p-4 rounded-lg border border-green-500/30 bg-green-950/20">
                            <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                                <KeyIcon className="w-4 h-4" />
                                초기 SSH 접속 정보
                            </h3>
                            <div className="space-y-2">
                                {instanceDetail.default_user && (
                                    <div className="flex items-center justify-between bg-black/30 rounded px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs text-slate-400">사용자</span>
                                            <span className="font-mono text-sm text-white">{instanceDetail.default_user}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs hover:text-green-400"
                                            onClick={() => handleCopy(instanceDetail.default_user!, "user")}
                                        >
                                            <CopyIcon className="w-3 h-3 mr-1" />
                                            {copied === "user" ? "복사됨" : "복사"}
                                        </Button>
                                    </div>
                                )}
                                {instanceDetail.default_password && (
                                    <div className="flex items-center justify-between bg-black/30 rounded px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <KeyIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs text-slate-400">비밀번호</span>
                                            <span className="font-mono text-sm text-white tracking-wider">{instanceDetail.default_password}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs hover:text-green-400"
                                            onClick={() => handleCopy(instanceDetail.default_password!, "password")}
                                        >
                                            <CopyIcon className="w-3 h-3 mr-1" />
                                            {copied === "password" ? "복사됨" : "복사"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                ⚠️ 이 비밀번호는 초기 접속용입니다. 보안을 위해 접속 후 변경하세요.
                            </p>
                        </div>
                    )}

                    <p className="mt-3 text-sm text-muted-foreground">상태: {instance.status}</p>
                    <Button className="mt-3" onClick={() => window.location.href = '/console/instance/view'}>
                        인스턴스 목록으로 이동
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}