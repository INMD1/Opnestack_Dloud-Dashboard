"use client";

import { useEffect, useState } from "react";
import { components } from "@/lib/skyline-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Instance = components["schemas"]["ServersResponseBase"];

export default function ClientInstanceStatus({
    instanceId,
}: {
    instanceId: string;
}) {
    const [instance, setInstance] = useState<Instance | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            } catch (errer) {
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
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>상태를 불러오는 중...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>인스턴스 {instanceId} 상태를 확인 중...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{instance.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>상태: {instance.status}</p>
                    <Button onClick={() => window.location.href = '/console/instance/view'}>
                        인스턴스 목록으로 이동
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}