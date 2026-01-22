"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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

    // Form state for Port Forwarding
    const [internalIp, setInternalIp] = useState("");
    const [internalPort, setInternalPort] = useState("");
    const [externalPort, setExternalPort] = useState("");
    const [protocol, setProtocol] = useState("tcp");

    async function fetchData() {
        setLoading(true);
        try {
            const [portsRes, portForwardsRes] = await Promise.all([
                fetch("/api/v1/extension/ports").then(res => res.json()),
                fetch("/api/v1/port_forwardings/stats").then(res => res.json())
            ]);

            if (portsRes && portsRes.ports) {
                setIps(portsRes.ports);
            }

            if (portForwardsRes) {
                setPortForwards(portForwardsRes.port_forwardings || []);
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
        // Validation
        if (!internalIp || !internalPort || !externalPort) {
            alert("모든 필수 필드를 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/v1/port_forwardings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    internal_ip: internalIp,
                    internal_port: parseInt(internalPort, 10),
                    external_port: parseInt(externalPort, 10),
                    protocol: protocol,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create port forwarding rule");
            }

            alert("포트 포워딩 규칙이 성공적으로 생성되었습니다.");
            setPortForwardDialogOpen(false);
            fetchData(); // Refresh data
        } catch (error) {
            alert(`포트 포워딩 규칙 생성에 실패했습니다.`);
            console.error(error);
        }
    };


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">네트워크 관리</h1>
                    <p className="text-muted-foreground mt-2">
                        IP 주소와 포트 포워딩 규칙을 확인합니다.(생성/삭제는 개발중).
                    </p>
                </div>
                {/* <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
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
                            <Button variant="outline" size="lg" onClick={() => alert("외부 IP 신청 양식으로 이동합니다.")}>
                                외부 IP 신청
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => setPortForwardDialogOpen(true)}>
                                포트 포워딩 신청
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog> */}

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
                                <Label htmlFor="internal-ip" className="text-right">내부 IP</Label>
                                <Input id="internal-ip" value={internalIp} onChange={(e) => setInternalIp(e.target.value)} className="col-span-3" placeholder="e.g., 192.168.1.10" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal-port" className="text-right">내부 포트</Label>
                                <Input id="internal-port" type="number" value={internalPort} onChange={(e) => setInternalPort(e.target.value)} className="col-span-3" placeholder="e.g., 80" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="external-port" className="text-right">외부 포트</Label>
                                <Input id="external-port" type="number" value={externalPort} onChange={(e) => setExternalPort(e.target.value)} className="col-span-3" placeholder="e.g., 8080" />
                            </div>
                            {/* Protocol selection can be added here if needed */}
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreatePortForwarding}>신청</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>IP 주소 목록</CardTitle>
                        <CardDescription>계정에 할당된 내부 및 외부(Floating) IP 주소입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <IpTable ips={ips} loading={loading} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>포트 포워딩 규칙</CardTitle>
                        <CardDescription>외부 포트와 인스턴스 내부 포트를 연결하는 규칙입니다.(SSH는 표기 제외)</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5">
                        <PortForwardTable portForwards={portForwards} loading={loading} />
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
                    <TableHead className="text-right pr-6">작업</TableHead>
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
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>연결 관리</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">IP 반납</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function PortForwardTable({ portForwards, loading }: { portForwards: PortForward[], loading: boolean }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>외부 포트</TableHead>
                    <TableHead>내부 포트</TableHead>

                    <TableHead>대상 내부 IP</TableHead>
                    <TableHead className="text-right pr-6">작업</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">목록을 불러오는 중입니다...</TableCell></TableRow>
                ) : portForwards.map(pf => (
                    <TableRow key={pf.id}>
                        <TableCell className="font-medium">{pf.external_port}</TableCell>
                        <TableCell>{pf.internal_port}</TableCell>
                        <TableCell className="font-mono">{pf.internal_ip_address}</TableCell>
                        <TableCell className="text-right">
                            {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>규칙 수정</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">규칙 삭제</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu> */}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
