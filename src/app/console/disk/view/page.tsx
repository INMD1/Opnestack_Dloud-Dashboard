"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { components } from "@/lib/skyline-api";

const statusStyles: { [key: string]: string } = {
    available: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    "in-use": "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100",
};

export default function DiskViewPage() {
    const [disks, setDisks] = useState<components["schemas"]["VolumesResponseBase"][]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newDiskName, setNewDiskName] = useState("");
    const [newDiskSize, setNewDiskSize] = useState("");

    // 삭제 다이얼로그 상태 관리
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<"confirm" | "deleting" | "success">("confirm");
    const [selectedDisk, setSelectedDisk] = useState<components["schemas"]["VolumesResponseBase"] | null>(null);

    async function fetchDisks() {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/extension/volumes");
            if (!res.ok) {
                throw new Error("Failed to fetch disks");
            }
            const data = await res.json();
            if (data && data.volumes) {
                setDisks(data.volumes);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchDisks();
    }, []);

    const handleCreateDisk = async () => {
        if (!newDiskName || !newDiskSize) {
            alert("디스크 이름과 용량을 모두 입력해주세요.");
            return;
        }
        const size = parseInt(newDiskSize, 10);
        if (isNaN(size) || size <= 0) {
            alert("유효한 용량을 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/v1/extension/volumes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    volume: {
                        name: newDiskName,
                        size: size,
                    },
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create disk");
            }

            alert("디스크가 성공적으로 생성되었습니다.");
            setCreateDialogOpen(false);
            setNewDiskName("");
            setNewDiskSize("");
            fetchDisks(); // Refresh the list
        } catch (error: unknown) {
            console.error("Failed to create disk", error);
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            alert(`디스크 생성에 실패했습니다: ${errorMessage}`);
        }
    };

    // 삭제 확인 다이얼로그 열기
    const handleDeleteClick = (disk: components["schemas"]["VolumesResponseBase"]) => {
        setSelectedDisk(disk);
        setDeleteStatus("confirm");
        setDeleteDialogOpen(true);
    };

    // 실제 삭제 실행
    const deleteDisk = async () => {
        if (!selectedDisk) return;

        // 삭제 중 상태로 변경
        setDeleteStatus("deleting");

        try {
            const res = await fetch(`/api/v1/volumes?volume_name=${selectedDisk.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete disk");
            }

            // 응답이 비어있을 수 있으므로 확인
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;

            // 삭제 성공 상태로 변경
            setDeleteStatus("success");

            // 디스크 목록 업데이트
            if (data && data.volumes) {
                setDisks(data.volumes);
            } else {
                // 응답에 volumes가 없으면 다시 fetch
                await fetchDisks();
            }

            // 2초 후 다이얼로그 닫기
            setTimeout(() => {
                setDeleteDialogOpen(false);
                setSelectedDisk(null);
                setDeleteStatus("confirm");
            }, 2000);
        } catch (error) {
            console.error(error);
            // 에러 발생 시 다이얼로그 닫기
            setDeleteDialogOpen(false);
            setSelectedDisk(null);
            setDeleteStatus("confirm");
            alert("디스크 삭제에 실패했습니다.");
        }
    };

    // 다이얼로그 취소
    const handleDialogCancel = () => {
        if (deleteStatus !== "deleting") {
            setDeleteDialogOpen(false);
            setSelectedDisk(null);
            setDeleteStatus("confirm");
        }
    };

    const availableDisks = disks.filter(d => d.status === 'available');
    const attachedDisks = disks.filter(d => d.status === 'in-use');

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">디스크 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        생성된 디스크(볼륨)를 확인하고 관리합니다.
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            새 디스크 생성
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>새 디스크 생성</DialogTitle>
                            <DialogDescription>
                                디스크의 이름과 용량을 설정합니다. 생성 후 인스턴스에 연결할 수 있습니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">이름</Label>
                                <Input id="name" placeholder="e.g., my-data-disk" className="col-span-3" value={newDiskName} onChange={(e) => setNewDiskName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="size" className="text-right">용량 (GB)</Label>
                                <Input id="size" type="number" placeholder="e.g., 50" className="col-span-3" value={newDiskSize} onChange={(e) => setNewDiskSize(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateDisk}>생성</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <Tabs defaultValue="attached">
                <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                    <TabsTrigger value="attached">연결된 디스크</TabsTrigger>
                    <TabsTrigger value="available">사용 가능한 디스크</TabsTrigger>
                </TabsList>
                <TabsContent value="attached">
                    <DiskTable disks={attachedDisks} loading={loading} onDelete={handleDeleteClick} />
                </TabsContent>
                <TabsContent value="available">
                    <DiskTable disks={availableDisks} loading={loading} onDelete={handleDeleteClick} />
                </TabsContent>
            </Tabs>

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
                                    <DialogTitle>디스크 삭제 확인</DialogTitle>
                                </div>
                            </DialogHeader>
                            <div className="pt-2 text-sm text-muted-foreground">
                                정말로 <strong className="text-foreground">{selectedDisk?.name}</strong> 디스크를 삭제하시겠습니까?
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
                                    onClick={deleteDisk}
                                >
                                    삭제
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {deleteStatus === "deleting" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>디스크 삭제 중</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 pt-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <div className="text-sm text-center">
                                    <strong>{selectedDisk?.name}</strong>을(를) 삭제하는 중입니다...
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
                                    <strong>{selectedDisk?.name}</strong>이(가) 성공적으로 삭제되었습니다.
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DiskTable({ disks, loading, onDelete }: {
    disks: components["schemas"]["VolumesResponseBase"][],
    loading: boolean,
    onDelete: (disk: components["schemas"]["VolumesResponseBase"]) => void
}) {
    return (
        <Card className="mt-4">
            <CardContent className="p-5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>용량</TableHead>
                            <TableHead>연결된 인스턴스</TableHead>
                            <TableHead>생성일</TableHead>
                            <TableHead className="text-right pr-6">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-48">목록을 불러오는 중입니다...</TableCell></TableRow>
                        ) : disks.length > 0 ? (
                            disks.map((disk) => (
                                <TableRow key={disk.id}>
                                    <TableCell className="font-medium">{disk.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusStyles[disk.status as string]}>
                                            {disk.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{disk.size} GB</TableCell>
                                    <TableCell>{disk.attachments?.[0]?.server_name || "-"}</TableCell>
                                    <TableCell>{new Date(disk.created_at as string).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {disk.status === 'available' && <DropdownMenuItem>인스턴스에 연결</DropdownMenuItem>}
                                                {disk.status === 'in-use' && <DropdownMenuItem>인스턴스에서 분리</DropdownMenuItem>}
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(disk);
                                                    }}
                                                >
                                                    삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} className="text-center h-48">해당 유형의 디스크가 없습니다.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
