"use client"

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Terminal } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface PortForwarding {
    id: number;
    rule_id: string;
    rule_name: string;
    user_vm_id: string;
    user_vm_name: string;
    user_vm_internal_ip: string;
    user_vm_internal_port: number;
    proxy_external_ip: string;
    proxy_external_port: number;
    protocol: string;
    status: string;
}
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Instance {
    created: string;
    status: string;
    created_at: string;
    id: string;
    name: string;
    port_forwardings?: PortForwarding[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addresses?: any;
}

export default function InstanceInfoPage() {
    const params = useParams();
    const instanceId = params.instanceId as string;
    const [instance, setInstance] = useState<Instance | null>(null);
    const [portForwardings, setPortForwardings] = useState<PortForwarding[]>([]);
    const [internalIp, setInternalIp] = useState<string>("");
    const [novnc, setNovnc] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // 포트포워딩 추가 폼 상태
    const [internalPort, setInternalPort] = useState("");
    const [externalPort, setExternalPort] = useState("");
    const [protocol, setProtocol] = useState("tcp");
    const [isAdding, setIsAdding] = useState(false);

    const fetchInstanceData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/instances?instance_id=${instanceId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch instance");
            }
            const data = await res.json();
            setInstance(data);
            console.log(data);
            // Internal IP 추출
            if (data.addresses["private-net"][0].addr && data.addresses["private-net"][0].addr.length > 0) {
                setInternalIp(data.addresses["private-net"][0].addr);
            } else if (data.addresses) {
                // addresses에서 첫 번째 fixed IP 추출
                const networks = Object.values(data.addresses);
                if (networks.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fixedIp = (networks[0] as any[]).find((addr: any) => addr["OS-EXT-IPS:type"] === "fixed");
                    if (fixedIp) {
                        setInternalIp(fixedIp.addr);
                    }
                }
            }

        } catch (error) {
            console.error(error);
            toaster.create({
                title: "오류",
                description: "인스턴스 정보를 불러오는 데 실패했습니다.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [instanceId]);

    const fetchPortForwardings = useCallback(async () => {
        try {
            const res = await fetch(`/api/v1/portforward/vm/${instanceId}`);
            if (res.ok) {
                const data = await res.json();
                setPortForwardings(data);
            }
        } catch (error) {
            console.error("Failed to fetch port forwardings:", error);
        }
    }, [instanceId]);

    const fetchNovnc = useCallback(async () => {
        try {
            const res = await fetch(`/api/v1/novnc?instance_id=${instanceId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch novnc");
            }
            const data = await res.json();
            setNovnc(data["remote_console"]?.url ? (() => { const u = new URL(data["remote_console"].url); u.hostname = process.env.NEXT_PUBLIC_NOVNC ?? ""; u.protocol = "http:"; return u.toString(); })() : "");
        } catch (error) {
            console.error(error);
        }
    }, [instanceId]);

    useEffect(() => {
        fetchInstanceData();
        fetchPortForwardings();
        fetchNovnc();
    }, [fetchInstanceData, fetchPortForwardings, fetchNovnc]);

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
            // 서버 정보 새로고침
            const refreshRes = await fetch(`/api/v1/instances?instance_id=${instanceId}`);
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data && data.servers) {
                    setInstance(data.servers);
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
            // 서버 정보 새로고침
            const refreshRes = await fetch(`/api/v1/instances?instance_id=${instanceId}`);
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data && data.servers) {
                    setInstance(data.servers);
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
            // 서버 정보 새로고침
            const refreshRes = await fetch(`/api/v1/instances?instance_id=${instanceId}`);
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setInstance(data);
            }
        } catch (error) {
            console.error(error);
            alert("인스턴스 재시작에 실패했습니다.");
        }
    };



    async function handleAddPortForwarding() {
        if (!internalPort) {
            toaster.create({
                title: "오류",
                description: "내부 포트를 입력해주세요.",
                type: "error",
            });
            return;
        }

        if (!internalIp) {
            toaster.create({
                title: "오류",
                description: "인스턴스의 Internal IP를 찾을 수 없습니다.",
                type: "error",
            });
            return;
        }

        setIsAdding(true);
        try {
            const body = {
                rule_name: `pf-${instanceId.substring(0, 8)}-${internalPort}`,
                user_vm_id: instanceId,
                user_vm_name: instance?.name || "unknown",
                user_vm_internal_ip: internalIp,
                user_vm_internal_port: parseInt(internalPort),
                proxy_external_port: externalPort ? parseInt(externalPort) : null,
                protocol: protocol,
                service_type: parseInt(internalPort) === 22 ? "ssh" : "other"
            };

            const res = await fetch("/api/v1/portforward", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Failed to add port forwarding");
            }

            toaster.create({
                title: "성공",
                description: "포트포워딩이 추가되었습니다.",
                type: "success",
            });

            // 폼 초기화
            setInternalPort("");
            setExternalPort("");
            setProtocol("tcp");
            window.location.reload();
            // 인스턴스 데이터 다시 불러오기
            fetchInstanceData();

        } catch (error: unknown) {
            console.error(error);
            toaster.create({
                title: "오류",
                description: error instanceof Error ? error.message : "포트포워딩 추가에 실패했습니다.",
                type: "error",
            });
        } finally {
            setIsAdding(false);
        }
    }

    async function handleDeletePortForwarding(pf: PortForwarding) {
        if (!confirm(`포트포워딩 ${pf.proxy_external_port} -> ${pf.user_vm_internal_port}을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/v1/portforward/${pf.rule_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status !== 204) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to delete port forwarding");
            }

            toaster.create({
                title: "성공",
                description: "포트포워딩이 삭제되었습니다.",
                type: "success",
            });

            // 목록 새로고침
            fetchPortForwardings();
        } catch (error: unknown) {
            console.error(error);
            toaster.create({
                title: "오류",
                description: error instanceof Error ? error.message : "포트포워딩 삭제에 실패했습니다.",
                type: "error",
            });
        }
    }

    function handleDeleteClick(_instance: Instance | null) {
        throw new Error("Function not implemented.");
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8  justify-between">
                <div>
                    <div className="flex justify-between gap-2"> <h1 className="text-4xl font-bold tracking-tight">인스턴스 정보</h1>        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover-lift">
                                <span className="sr-only">메뉴 열기</span>
                                작업
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {instance?.status === 'SHUTOFF' && (
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    startInstance(instance.id);
                                }}>
                                    시작
                                </DropdownMenuItem>
                            )}
                            {instance?.status === 'ACTIVE' && (
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    rebootInstance(instance.id);
                                }}>
                                    재시작
                                </DropdownMenuItem>
                            )}
                            {instance?.status === 'ACTIVE' && (
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
                    </DropdownMenu></div>
                    <p className="text-muted-foreground mt-2">
                        ID: {instanceId}
                    </p>
                    {instance && (
                        <p className="text-muted-foreground">
                            이름: {instance.name}
                        </p>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 포트포워딩 관리 */}
                <Card>
                    <CardHeader>
                        <CardTitle>포트포워딩</CardTitle>
                        <CardDescription>VM에 연결된 포트포워딩 규칙을 관리합니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-muted-foreground">로딩 중...</p>
                        ) : (
                            <>
                                {portForwardings.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>외부 IP</TableHead>
                                                <TableHead>외부 포트</TableHead>
                                                <TableHead>내부 포트</TableHead>
                                                <TableHead>프로토콜</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {portForwardings.map((pf) => (
                                                <TableRow key={pf.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {pf.proxy_external_ip}
                                                    </TableCell>
                                                    <TableCell>{pf.proxy_external_port}</TableCell>
                                                    <TableCell>{pf.user_vm_internal_port}</TableCell>
                                                    <TableCell>{pf.protocol.toUpperCase()}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeletePortForwarding(pf)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">포트포워딩이 설정되지 않았습니다.</p>
                                )}

                                {/* 포트포워딩 추가 폼 */}
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger> <h4 className="font-semibold">포트포워딩 추가</h4></AccordionTrigger>
                                        <AccordionContent>
                                            <div className=" space-y-4 border-t pt-4">

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="internal-port">내부 포트 *</Label>
                                                        <Input
                                                            id="internal-port"
                                                            type="number"
                                                            placeholder="80"
                                                            value={internalPort}
                                                            onChange={(e) => setInternalPort(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="external-port">외부 포트 (선택사항)</Label>
                                                        <Input
                                                            id="external-port"
                                                            type="number"
                                                            placeholder="자동 할당"
                                                            value={externalPort}
                                                            onChange={(e) => setExternalPort(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="protocol">프로토콜</Label>
                                                    <select
                                                        id="protocol"
                                                        value={protocol}
                                                        onChange={(e) => setProtocol(e.target.value)}
                                                        className="w-full p-2 border rounded-md bg-background"
                                                    >
                                                        <option value="tcp">TCP</option>
                                                        <option value="udp">UDP</option>
                                                    </select>
                                                </div>
                                                <Button
                                                    onClick={handleAddPortForwarding}
                                                    disabled={isAdding}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {isAdding ? "추가 중..." : "포트포워딩 추가"}
                                                </Button>
                                                <p className="text-xs text-muted-foreground">
                                                    * 외부 포트를 비워두면 자동으로 사용 가능한 포트가 할당됩니다.
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                            </>
                        )}
                    </CardContent>
                </Card>

                {/* 인스턴스 상세 정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle>상세 정보</CardTitle>
                        <CardDescription>인스턴스의 상세 정보입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-muted-foreground">로딩 중...</p>
                        ) : instance ? (
                            <div className="space-y-2">
                                <p className="text-lg"><strong>이름: </strong>{instance.name}</p>
                                <p className="text-lg"><strong>내부 IP: </strong>{instance.addresses["private-net"][0].addr}</p>
                                <p className="text-lg"><strong>상태: </strong>{instance.status}</p>
                                <p className="text-lg"><strong>생성일: </strong>{instance.created}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">인스턴스 정보를 불러올 수 없습니다.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* NoVNC 콘솔 */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>원격 접속</CardTitle>
                        <CardDescription>브라우저에서 VM에 직접 접속할 수 있습니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <Terminal />
                            <AlertTitle>안내사항</AlertTitle>
                            <AlertDescription>
                                VNC 접속을 할때 나오는 비빌번호 입력은 처음에 Key로 로그인후 내부에서 비밀번호 설정을 해줘야 입력가능합니다
                            </AlertDescription>
                        </Alert>
                        <Button onClick={() => window.open(novnc)}>VNC 접속</Button>
                        {/* {novnc ? (
                            <iframe
                                className="rounded-md w-full"
                                src={novnc}
                                height="600px"
                                title="NoVNC Console"
                            />
                        ) : (
                            <p className="text-muted-foreground">콘솔 URL을 불러오는 중...</p>
                        )} */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
