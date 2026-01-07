"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";



export default function InstanceInfoPage() {
    const params = useParams();
    const instanceId = params.instanceId as string;
    const [instances, setInstances] = useState<[]>([]);
    const [novnc, setNovnc] = useState<"">("");
    useEffect(() => {
        async function fetchInstances() {
            try {
                const res = await fetch(`/api/v1/instances?instance_id=${instanceId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch instances");
                }
                const data = await res.json();
                setInstances(data);
            } catch (error) {
                console.error(error);
            }
        }
        async function fetchNovnc() {
            try {
                const res = await fetch(`/api/v1/novnc?instance_id=${instanceId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch instances");
                }
                const data = await res.json();
                setNovnc(data["remote_console"].url);
            } catch (error) {
                console.error(error);
            }
        }
        fetchNovnc();
        fetchInstances();
    }, [instanceId]);
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">인스턴스 정보</h1>
                    <p className="text-muted-foreground mt-2">
                        ID: {instanceId}
                    </p>
                </div>
            </header>
            <div className="flex gap-5 ">
                <Card className="flex-1">
                </Card>
                <div className="flex-2">
                    <p className="text-2xl font-bold">원격 접속</p>
                    <iframe className="rounded-md" src={novnc} width="100%" height="600px" title="NoVNC Console">
                    </iframe>
                </div>
            </div>
        </div>
    );
}
