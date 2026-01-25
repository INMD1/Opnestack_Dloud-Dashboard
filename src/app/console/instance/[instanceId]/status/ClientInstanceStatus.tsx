"use client";

import { useEffect, useState } from "react";
import { components } from "@/lib/skyline-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

type Instance = components["schemas"]["ServersResponseBase"];

export default function ClientInstanceStatus({
    instanceId,
}: {
    instanceId: string;
}) {
    const [instance, setInstance] = useState<Instance | null>(null);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/v1/extension/servers?uuid=${instanceId}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || "Failed to fetch instance status");
                }
                const data = await res.json();

                if (data.servers && data.servers.length > 0) {
                    const serverData = data.servers[0];
                    setInstance(serverData);

                    if (serverData.status === "ACTIVE" || serverData.status === "ERROR") {
                        clearInterval(intervalId);
                    }
                } else {
                    console.log("Instance not found yet, retrying...");
                }
            } catch (_error) {
                clearInterval(intervalId);
            }
        };

        const intervalId = setInterval(fetchStatus, 5000);
        fetchStatus();
        return () => clearInterval(intervalId);
    }, [instanceId]);

    if (error) {
        return (
            <Card className="w-full max-w-lg bg-destructive text-destructive-foreground">
                <CardHeader>
                    <CardTitle>오류 발생</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!instance) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>서버 제작 시작</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <CheckCircle2Icon />
                            <AlertTitle>확인해 주세요!</AlertTitle>
                            <AlertDescription>
                                현재 보고있는 페이지는 디스크가 생성되고 있는 중입니다. 이 디스크 생성은 1~5분 정도 소요됩니다.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-3">인스턴스 디스크 생성중...</div>
                    </CardContent>
                </Card>
            </div>

        );
    }

    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{instance.name} 생성 완료</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>상태: {instance.status}</p>
                    <Button className="mt-3" onClick={() => window.location.href = '/console/instance/view'}>
                        인스턴스 목록으로 이동
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}