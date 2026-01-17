// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { components } from "@/lib/skyline-api";
import { useRouter } from "next/navigation";

//데이터 예제

export const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",

  BUILD: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  REBUILD: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  RESIZE: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  MIGRATING: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",

  REBOOT: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  HARD_REBOOT: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",

  PAUSED: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  SHUTOFF: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  SUSPENDED: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  SHELVED: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
  SHELVED_OFFLOADED: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",

  RESCUE: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",

  ERROR: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  SOFT_DELETED: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",

  UNKNOWN: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100",
};


export default function InstanceViewPage() {
    const router = useRouter();
    const [instances, setInstances] = useState<components["schemas"]["ServersResponseBase"][]>([]);
    const [loading, setLoading] = useState(true);

    // 다이얼로그 상태 관리
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<"confirm" | "deleting" | "success">("confirm");
    const [selectedInstance, setSelectedInstance] = useState<components["schemas"]["ServersResponseBase"] | null>(null);

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

    // 삭제 확인 다이얼로그 열기
    const handleDeleteClick = (instance: components["schemas"]["ServersResponseBase"]) => {
        setSelectedInstance(instance);
        setDeleteStatus("confirm");
        setDeleteDialogOpen(true);
    };

    // 실제 삭제 실행
    const deleteInstance = async () => {
        if (!selectedInstance) return;

        // 삭제 중 상태로 변경
        setDeleteStatus("deleting");

        try {
            const res = await fetch(`/api/v1/instances?instance_id=${selectedInstance.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete instance");
            }

            // 응답이 비어있을 수 있으므로 확인
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            // 삭제 성공 상태로 변경
            setDeleteStatus("success");

            // 인스턴스 목록 업데이트
            if (data && data.servers) {
                setInstances(data.servers);
            }

            // 2초 후 다이얼로그 닫기
            setTimeout(() => {
                setDeleteDialogOpen(false);
                setSelectedInstance(null);
                setDeleteStatus("confirm");
            }, 2000);
        } catch (error) {
            console.error(error);
            // 에러 발생 시 다이얼로그 닫기
            setDeleteDialogOpen(false);
            setSelectedInstance(null);
            setDeleteStatus("confirm");
            alert("인스턴스 삭제에 실패했습니다.");
        }
    };

    // 다이얼로그 취소
    const handleDialogCancel = () => {
        if (deleteStatus !== "deleting") {
            setDeleteDialogOpen(false);
            setSelectedInstance(null);
            setDeleteStatus("confirm");
        }
    };

    // 인스턴스 시작
    const startInstance = async (instanceId: string) => {
        try {
            const res = await fetch(`/api/v1/instances/${instanceId}/start`, {
                method: "POST",
            });
            if (!res.ok) {
                throw new Error("Failed to start instance");
            }
            alert("인스턴스를 시작했습니다.");
            // 목록 새로고침
            const refreshRes = await fetch("/api/v1/extension/servers");
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data && data.servers) {
                    setInstances(data.servers);
                }
            }
        } catch (error) {
            console.error(error);
            alert("인스턴스 시작에 실패했습니다.");
        }
    };

    // 인스턴스 정지
    const stopInstance = async (instanceId: string) => {
        try {
            const res = await fetch(`/api/v1/instances/${instanceId}/stop`, {
                method: "POST",
            });
            if (!res.ok) {
                throw new Error("Failed to stop instance");
            }
            alert("인스턴스를 정지했습니다.");
            // 목록 새로고침
            const refreshRes = await fetch("/api/v1/extension/servers");
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data && data.servers) {
                    setInstances(data.servers);
                }
            }
        } catch (error) {
            console.error(error);
            alert("인스턴스 정지에 실패했습니다.");
        }
    };

    // 인스턴스 재시작
    const rebootInstance = async (instanceId: string) => {
        try {
            const res = await fetch(`/api/v1/instances/${instanceId}/reboot`, {
                method: "POST",
            });
            if (!res.ok) {
                throw new Error("Failed to reboot instance");
            }
            alert("인스턴스를 재시작했습니다.");
            // 목록 새로고침
            const refreshRes = await fetch("/api/v1/extension/servers");
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data && data.servers) {
                    setInstances(data.servers);
                }
            }
        } catch (error) {
            console.error(error);
            alert("인스턴스 재시작에 실패했습니다.");
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="">인스턴스 목록</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        생성된 가상 머신 인스턴스를 확인하고 관리합니다.
                    </p>
                </div>
                <Button
                    onClick={() => window.location.href = '/console/instance/create'}
                    className="gradient-primary text-white hover-lift"
                >
                    새 인스턴스 생성
                </Button>
            </header>

            <Card className="hover-lift">
                <CardContent className="p-5">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10">
                                <TableHead className="font-bold">이름</TableHead>
                                <TableHead className="font-bold">상태</TableHead>
                                <TableHead className="font-bold">사양 (Flavor)</TableHead>
                                <TableHead className="font-bold">IP 주소</TableHead>
                                <TableHead className="font-bold">생성일</TableHead>
                                <TableHead className="text-right pr-6 font-bold">작업</TableHead>
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
                                    <TableRow
                                        onClick={() => router.push(`/console/instance/${instance.id}/info`)}
                                        key={instance.id}
                                        className="transition-all duration-200 hover:bg-accent/50 hover:border-l-4 hover:border-primary"
                                    >
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
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover-lift">
                                                        <span className="sr-only">메뉴 열기</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { router.push(`/console/instance/${instance.id}/info`) }}>
                                                        정보
                                                    </DropdownMenuItem>
                                                    {instance.status === 'SHUTOFF' && (
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            startInstance(instance.id);
                                                        }}>
                                                            시작
                                                        </DropdownMenuItem>
                                                    )}
                                                    {instance.status === 'ACTIVE' && (
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            rebootInstance(instance.id);
                                                        }}>
                                                            재시작
                                                        </DropdownMenuItem>
                                                    )}
                                                    {instance.status === 'ACTIVE' && (
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            stopInstance(instance.id);
                                                        }}>
                                                            정지
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(instance);
                                                    }}>
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

            {/* 삭제 확인/진행/완료 다이얼로그 */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
                if (!open && deleteStatus !== "deleting") {
                    handleDialogCancel();
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    {deleteStatus === "confirm" && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <DialogTitle>인스턴스 삭제 확인</DialogTitle>
                                </div>
                            </DialogHeader>
                            <div className="pt-2 text-sm text-muted-foreground">
                                정말로 <strong className="text-foreground">{selectedInstance?.name}</strong> 인스턴스를 삭제하시겠습니까?
                                <br />
                                <span className="text-red-500 text-sm">이 작업은 되돌릴 수 없습니다.</span>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDialogCancel}
                                >
                                    취소
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={deleteInstance}
                                >
                                    삭제
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {deleteStatus === "deleting" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>인스턴스 삭제 중</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 pt-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <div className="text-sm text-center">
                                    <strong>{selectedInstance?.name}</strong>을(를) 삭제하는 중입니다...
                                </div>
                                <div className="text-sm text-muted-foreground">잠시만 기다려 주세요.</div>
                            </div>
                        </>
                    )}

                    {deleteStatus === "success" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>삭제 완료</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 pt-4">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                                <div className="text-sm text-center">
                                    <strong>{selectedInstance?.name}</strong>이(가) 성공적으로 삭제되었습니다.
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
