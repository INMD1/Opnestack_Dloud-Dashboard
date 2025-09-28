"use client";

import { useEffect, useState } from "react";
import { components } from "@/lib/skyline-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Instance = components["schemas"]["ServersResponseBase"];

export default function InstanceStatusPage({ params }: { params: { instanceId: string } }) {
    const { instanceId } = params;
    const [instance, setInstance] = useState<Instance | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Note: The actual API endpoint for a single instance might be different.
                // This assumes an endpoint like /api/v1/extension/servers/{instanceId} exists
                // or that the list endpoint can be filtered by a single uuid.
                // For this implementation, we'll filter from the list endpoint.
                const res = await fetch(`/api/v1/extension/servers?uuid=${instanceId}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || "Failed to fetch instance status");
                }
                const data = await res.json();
                
                if (data.servers && data.servers.length > 0) {
                    const serverData = data.servers[0];
                    setInstance(serverData);

                    if (serverData.status === 'ACTIVE' || serverData.status === 'ERROR') {
                        clearInterval(intervalId);
                    }
                } else {
                    // If the server is not found initially, it might still be provisioning.
                    // We don't clear the interval here to allow for retries.
                    console.log("Instance not found yet, retrying...");
                }
            } catch (err: any) {
                setError(err.message);
                clearInterval(intervalId);
            }
        };

        const intervalId = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        fetchStatus(); // Initial fetch

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [instanceId]);

    const renderContent = () => {
        if (error) {
            return (
                <Card className="w-full max-w-lg bg-destructive text-destructive-foreground">
                    <CardHeader>
                        <CardTitle>오류 발생</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>인스턴스 상태를 가져오는 중 오류가 발생했습니다.</p>
                        <p className="mt-2 font-mono bg-background text-destructive p-2 rounded">
                            {error}
                        </p>
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
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                            <span>인스턴스 <strong>({instanceId})</strong>의 상태를 확인하고 있습니다. 잠시만 기다려주세요.</span>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (instance.status === 'BUILD' || instance.status === 'REBUILD') {
            return (
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>인스턴스 생성 중</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-primary animate-spin"></div>
                            <p>상태: <strong>{instance.status}</strong></p>
                        </div>
                        <p className="mt-4 text-muted-foreground">
                            인스턴스가 준비되는 동안 이 페이지는 자동으로 업데이트됩니다.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        if (instance.status === 'ACTIVE') {
            const internalIp = instance.fixed_addresses?.[0];
            return (
                <Card className="w-full max-w-lg bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">인스턴스 생성 완료!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-green-700 space-y-2">
                        <div><strong>ID:</strong> <span className="font-mono">{instance.id}</span></div>
                        <div><strong>이름:</strong> {instance.name}</div>
                        <div><strong>상태:</strong> <span className="font-semibold text-green-900">{instance.status}</span></div>
                        <div><strong>IP 주소:</strong> {internalIp || '할당 중...'}</div>
                        <div className="pt-4">
                            <Button onClick={() => window.location.href = '/console/instance/view'}>
                                인스턴스 목록으로 이동
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (instance.status === 'ERROR') {
            return (
                <Card className="w-full max-w-lg bg-destructive text-destructive-foreground">
                    <CardHeader>
                        <CardTitle>인스턴스 생성 오류</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>인스턴스를 생성하는 중 오류가 발생했습니다.</p>
                        <p className="mt-2">상태: <strong className="font-mono">{instance.status}</strong></p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>알 수 없는 상태</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>인스턴스 상태: <strong>{instance.status}</strong></p>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            {renderContent()}
        </div>
    );
}
