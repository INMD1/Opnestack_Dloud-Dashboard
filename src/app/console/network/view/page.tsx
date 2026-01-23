"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { components } from "@/lib/skyline-api";

interface PortForward {
    internal_ip_address: string;
    id: string;
    external_port: number;
    internal_port: number;
    instance_name: string;
    internal_ip: string;
}

interface OriginData {
    fixed_ips?: Array<{ ip_address: string }>;
    device_owner?: string;
}

export default function NetworkViewPage() {
    const [ips, setIps] = useState<components["schemas"]["PortsResponseBase"][]>([]);
    const [portForwards, setPortForwards] = useState<PortForward[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);
    const [isPortForwardDialogOpen, setPortForwardDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingPortForward, setDeletingPortForward] = useState<PortForward | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 리미트 상태
    const [limits, setLimits] = useState<{ port_forwarding?: { current: number; max: number } } | null>(null);

    // Form state for Port Forwarding
    const [selectedInstanceName, setSelectedInstanceName] = useState("");
    const [internalIp, setInternalIp] = useState("");
    const [internalPort, setInternalPort] = useState("");
    const [externalPort, setExternalPort] = useState("");
    const [externalPortMode, setExternalPortMode] = useState<"auto" | "manual">("auto");
    const [protocol, setProtocol] = useState("tcp");
    const [instances, setInstances] = useState<components["schemas"]["ServersResponseBase"][]>([]);
    const [instancesName, setInstancesName] = useState<string[]>([]);

    useEffect(() => {
        async function fetchInstances() {
            try {
                const res = await fetch("/api/v1/extension/servers");
                if (!res.ok) {
                    throw new Error("Failed to fetch instances");
                }
                const data = await res.json();
                if (data && data.servers) {
                    setInstances(data.servers);
                }
                setInstancesName(data.servers.map((data: { name: any; }) => data.name));
            } catch (error) {
                console.error(error);
            }
        }
        fetchInstances();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [portsRes, portForwardsRes, limitsRes] = await Promise.all([
                fetch("/api/v1/extension/ports").then(res => res.json()),
                fetch("/api/v1/port_forwardings/stats").then(res => res.json()),
                fetch("/api/v1/limits").then(res => res.json())
            ]);

            if (portsRes && portsRes.ports) {
                setIps(portsRes.ports);
            }

            if (portForwardsRes) {
                setPortForwards(portForwardsRes.port_forwardings || []);
            }

            if (limitsRes) {
                setLimits(limitsRes);
            }

        } catch (error) {
            console.error("Failed to fetch network data", error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePortForwarding = async () => {
        // 유효성 검증
        if (!internalIp || !internalPort) {
            alert("모든 필수 필드를 입력해주세요.");
            return;
        }

        // 수동 모드일 때만 외부 포트 필수
        if (externalPortMode === "manual" && !externalPort) {
            alert("외부 포트를 입력해주세요.");
            return;
        }

        // 리미트 체크
        if (limits?.port_forwarding) {
            const { current, max } = limits.port_forwarding;
            if (current >= max) {
                alert(`포트 포워딩 규칙 생성 한도를 초과했습니다. (현재: ${current}/${max})`);
                return;
            }
        }

        try {
            // 요청 body 생성
            const requestBody: any = {
                internal_ip: internalIp,
                internal_port: parseInt(internalPort, 10),
                protocol: protocol,
            };

            // 수동 모드일 때만 external_port 포함
            if (externalPortMode === "manual") {
                requestBody.external_port = parseInt(externalPort, 10);
            }

            const res = await fetch("/api/v1/port_forwardings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create port forwarding rule");
            }

            alert("포트 포워딩 규칙이 성공적으로 생성되었습니다.");
            setPortForwardDialogOpen(false);
            // 폼 초기화
            setSelectedInstanceName("");
            setInternalIp("");
            setInternalPort("");
            setExternalPort("");
            setExternalPortMode("auto");
            fetchData(); // 데이터 새로고침
        } catch (error) {
            alert(`포트 포워딩 규칙 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
            console.error(error);
        }
    };

    const handleDeletePortForwarding = async () => {
        if (!deletingPortForward) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/v1/port_forwardings", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: deletingPortForward.id,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to delete port forwarding rule");
            }

            alert("포트 포워딩 규칙이 성공적으로 삭제되었습니다.");
            setDeleteDialogOpen(false);
            setDeletingPortForward(null);
            fetchData(); // 데이터 새로고침
        } catch (error) {
            alert(`포트 포워딩 규칙 삭제에 실패했습니다.`);
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteDialog = (pf: PortForward) => {
        setDeletingPortForward(pf);
        setDeleteDialogOpen(true);
    };

    // 인스턴스 선택 시 IP 자동 입력
    const handleInstanceSelect = (instanceName: string) => {
        setSelectedInstanceName(instanceName);
        const selectedInstance = instances.find(inst => inst.name === instanceName);
        if (selectedInstance && selectedInstance.fixed_addresses && selectedInstance.fixed_addresses.length > 0) {
            // fixed_addresses는 배열이므로 첫 번째 IP를 사용
            const firstIp = selectedInstance.fixed_addresses[0] as string;
            setInternalIp(firstIp);
        }
    };


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">네트워크 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        IP 주소와 포트 포워딩 규칙을 관리합니다.
                    </p>
                </div>

                <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            신규 신청
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>신규 네트워크 서비스 신청</DialogTitle>
                            <DialogDescription>
                                원하는 서비스 유형을 선택하세요.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Button disabled variant="outline" size="lg">
                                외부 IP 신청 (개발중)
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => setPortForwardDialogOpen(true)}>
                                포트 포워딩 신청
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Port Forwarding Create Dialog */}
                <Dialog open={isPortForwardDialogOpen} onOpenChange={setPortForwardDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>새 포트 포워딩 규칙 생성</DialogTitle>
                            <DialogDescription>
                                외부 포트로 들어오는 트래픽을 인스턴스의 특정 내부 포트로 전달합니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal-ip" className="text-right">인스턴스</Label>
                                <Combobox
                                    items={instancesName}
                                    value={selectedInstanceName}
                                    onValueChange={(value) => {
                                        if (value && typeof value === 'string') {
                                            handleInstanceSelect(value);
                                        }
                                    }}
                                >
                                    <ComboboxInput className="col-span-3" placeholder="인스턴스 선택" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>인스턴스를 찾을 수 없습니다.</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem key={item} value={item}>
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal-ip" className="text-right">내부 IP</Label>
                                <Input id="internal-ip" value={internalIp} onChange={(e) => setInternalIp(e.target.value)} className="col-span-3" placeholder="e.g., 192.168.1.10" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal-port" className="text-right">내부 포트</Label>
                                <Input id="internal-port" type="number" value={internalPort} onChange={(e) => setInternalPort(e.target.value)} className="col-span-3" placeholder="e.g., 80" />
                            </div>

                            {/* 외부 포트 모드 선택 */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">외부 포트</Label>
                                <div className="col-span-3 space-y-3">
                                    {/* 라디오 버튼 그룹 */}
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="external-port-mode"
                                                value="auto"
                                                checked={externalPortMode === "auto"}
                                                onChange={(e) => setExternalPortMode(e.target.value as "auto")}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="text-sm">자동 할당</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="external-port-mode"
                                                value="manual"
                                                checked={externalPortMode === "manual"}
                                                onChange={(e) => setExternalPortMode(e.target.value as "manual")}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="text-sm">수동 입력</span>
                                        </label>
                                    </div>

                                    {/* 조건부 렌더링 */}
                                    {externalPortMode === "auto" ? (
                                        <p className="text-sm text-muted-foreground">
                                            시스템에서 사용 가능한 포트를 자동으로 할당합니다.
                                        </p>
                                    ) : (
                                        <Input
                                            id="external-port"
                                            type="number"
                                            value={externalPort}
                                            onChange={(e) => setExternalPort(e.target.value)}
                                            placeholder="e.g., 8080"
                                        />
                                    )}
                                </div>
                            </div>
                            {/* Protocol selection can be added here if needed */}
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreatePortForwarding}>신청</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Port Forwarding Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>포트 포워딩 규칙 삭제</DialogTitle>
                            <DialogDescription>
                                정말로 이 포트 포워딩 규칙을 삭제하시겠습니까?
                            </DialogDescription>
                        </DialogHeader>
                        {deletingPortForward && (
                            <div className="py-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">외부 포트:</span>
                                        <span className="text-sm">{deletingPortForward.external_port}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">내부 포트:</span>
                                        <span className="text-sm">{deletingPortForward.internal_port}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium">내부 IP:</span>
                                        <span className="text-sm font-mono">{deletingPortForward.internal_ip_address}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                                취소
                            </Button>
                            <Button variant="destructive" onClick={handleDeletePortForwarding} disabled={isDeleting}>
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </header>

            <div className="space-y-8 flex justify-center gap-10">
                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>IP 주소 목록</CardTitle>
                        <CardDescription>계정에 할당된 내부 및 외부(Floating) IP 주소입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <IpTable ips={ips} loading={loading} />
                    </CardContent>
                </Card>

                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>포트 포워딩 규칙</CardTitle>
                        <CardDescription>외부 포트와 인스턴스 내부 포트를 연결하는 규칙입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <PortForwardTable portForwards={portForwards} loading={loading} onDelete={openDeleteDialog} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function IpTable({ ips, loading }: { ips: components["schemas"]["PortsResponseBase"][], loading: boolean }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>IP 주소</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>연결된 리소스</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">목록을 불러오는 중입니다...</TableCell></TableRow>
                ) : ips.map(ip => (
                    <TableRow key={ip.id}>
                        <TableCell className="font-mono">{(ip.origin_data as OriginData)?.fixed_ips?.[0]?.ip_address}</TableCell>
                        <TableCell>
                            <Badge variant={ip.device_owner === 'network:floatingip' ? 'secondary' : 'outline'}>{ip.device_owner}</Badge>
                        </TableCell>
                        <TableCell>{ip.status}</TableCell>
                        <TableCell>{(ip.origin_data as OriginData)?.device_owner}</TableCell>

                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function PortForwardTable({ portForwards, loading, onDelete }: { portForwards: PortForward[], loading: boolean, onDelete: (pf: PortForward) => void }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>외부 포트</TableHead>
                    <TableHead>내부 포트</TableHead>
                    <TableHead>대상 내부 IP</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">목록을 불러오는 중입니다...</TableCell></TableRow>
                ) : portForwards.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">포트 포워딩 규칙이 없습니다.</TableCell></TableRow>
                ) : portForwards.map(pf => (
                    <TableRow key={pf.id}>
                        <TableCell className="font-medium">{pf.external_port}</TableCell>
                        <TableCell>{pf.internal_port}</TableCell>
                        <TableCell className="font-mono">{pf.internal_ip_address}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(pf)}
                                className="text-destructive hover:text-destructive"
                            >
                                삭제
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
