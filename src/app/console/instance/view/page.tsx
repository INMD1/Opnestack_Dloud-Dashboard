// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { components } from "@/lib/skyline-api";
import { useRouter } from "next/navigation";

//데이터 예제

const statusStyles: { [key: string]: string } = {
    Running: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    Stopped: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
    Error: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
};


export default function InstanceViewPage() {
    const router = useRouter();
    const [instances, setInstances] = useState<components["schemas"]["ServersResponseBase"][]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInstances() {
            setLoading(true);
            try {
                const res = await fetch("/api/v1/extension/servers");
                if (!res.ok) {
                    throw new Error("Failed to fetch instances");
                }
                const data = await res.json();
                if (data && data.servers) {
                    setInstances(data.servers);
                }
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        }
        fetchInstances();
    }, []);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">인스턴스 목록</h1>
                    <p className="text-muted-foreground mt-2">
                        생성된 가상 머신 인스턴스를 확인하고 관리합니다.
                    </p>
                </div>
                <Button onClick={() => window.location.href = '/console/instance/create'}>
                    새 인스턴스 생성
                </Button>
            </header>

            <Card>
                <CardContent className="p-5">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>사양 (Flavor)</TableHead>
                                <TableHead>IP 주소</TableHead>
                                <TableHead>생성일</TableHead>
                                <TableHead className="text-right pr-6">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-48">
                                        <p>인스턴스 목록을 불러오는 중입니다...</p>
                                    </TableCell>
                                </TableRow>
                            ) : instances.length > 0 ? (
                                instances.map((instance) => (
                                    <TableRow key={instance.id}>
                                        <TableCell className="font-medium">{instance.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusStyles[instance.status] || statusStyles.Stopped}>
                                                {instance.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{instance.flavor}</TableCell>
                                        <TableCell>{instance.fixed_addresses?.[0]}</TableCell>
                                        <TableCell>{new Date(instance.created_at as string).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">메뉴 열기</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {router.push(`/console/instance/${instance.id}/info`)}}>
                                                        정보
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => alert(`재시작: ${instance.name}`)}>
                                                        재시작
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => alert(`정지: ${instance.name}`)}>
                                                        정지
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => alert(`삭제: ${instance.name}`)}>
                                                        삭제
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-48">
                                        <p>생성된 인스턴스가 없습니다.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
