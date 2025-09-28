"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { components } from "@/lib/skyline-api";

export default function InstanceCreatePage() {
    const [flavors, setFlavors] = useState<components["schemas"]["Flavor"][]>([]);
    const [images, setImages] = useState<components["schemas"]["Image"][]>([]);
    const [keypairs, setKeypairs] = useState<components["schemas"]["Keypair"][]>([]);
    const [networks, setNetworks] = useState<components["schemas"]["Network"][]>([]);

    const [instanceName, setInstanceName] = useState("");
    const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
    const [cinervolume, setcinervolume] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedKeypair, setSelectedKeypair] = useState<string>("");
    const [selectedNetwork, setSelectedNetwork] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [additionalPorts, setAdditionalPorts] = useState<{ external: string, internal: string }[]>([]);
    const [newExternalPort, setNewExternalPort] = useState("");
    const [newInternalPort, setNewInternalPort] = useState("");

    const handleAddPort = () => {
        if (newExternalPort && newInternalPort) {
            setAdditionalPorts([...additionalPorts, { external: newExternalPort, internal: newInternalPort }]);
            setNewExternalPort("");
            setNewInternalPort("");
        }
    };

    const handleRemovePort = (index: number) => {
        setAdditionalPorts(additionalPorts.filter((_, i) => i !== index));
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [flavorsRes, imagesRes, keypairsRes, networksRes] = await Promise.all([
                    fetch("/api/v1/flavors").then(res => res.json()),
                    fetch("/api/v1/images").then(res => res.json()),
                    fetch("/api/v1/keypairs").then(res => res.json()),
                    fetch("/api/v1/networks").then(res => res.json()),
                ]);

                if (flavorsRes && flavorsRes.flavors) setFlavors(flavorsRes.flavors);
                if (imagesRes && imagesRes.images) {
                    setImages(imagesRes.images);
                    if (imagesRes.images.length > 0) setSelectedImage(imagesRes.images[0].id);
                }
                if (keypairsRes && keypairsRes.keypairs) {
                    setKeypairs(keypairsRes.keypairs);
                    if (keypairsRes.keypairs.length > 0) setSelectedKeypair(keypairsRes.keypairs[0].name);
                }
                if (networksRes && networksRes.networks) {
                    const filteredNetworks = networksRes.networks.filter(network => network.name !== 'external');
                    setNetworks(filteredNetworks);
                    if (filteredNetworks.length > 0) setSelectedNetwork(filteredNetworks[0].id!);
                }

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleCreateInstance = async () => {
        const portForwardings = [
            { external_port: 22, internal_port: 22 },
            ...additionalPorts.map(p => ({
                external_port: parseInt(p.external, 10),
                internal_port: parseInt(p.internal, 10)
            }))
        ].filter(p => !isNaN(p.external_port) && !isNaN(p.internal_port));

        const instanceData = {
            name: instanceName,
            image_id: selectedImage,
            flavor_id: selectedFlavor,
            key_name: selectedKeypair,
            network_id: selectedNetwork,
            additional_ports: portForwardings,
            volume_size: cinervolume
        };

        console.log(instanceData);
        if (!instanceName || !selectedFlavor || !selectedImage || !selectedNetwork || !selectedKeypair) {
            alert("모든 필드를 정확히 선택하고 인스턴스 이름을 입력해주세요.");
            return;
        }

        try {
            const res = await fetch("/api/v1/instances", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(instanceData),
            });

            if (res.status === 202) { // HTTP 202 Accepted
                const responseData = await res.json();
                const instanceId = responseData.id;
                // instanceId를 가지고 상태를 보여줄 페이지로 이동
                window.location.href = `/console/instance/${instanceId}/status`;
            } else {
                const error = await res.json();
                alert(`인스턴스 생성 요청 실패: ${error.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("Instance creation failed:", error);
            alert("인스턴스 생성 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">인스턴스 생성</h1>
                    <p className="text-muted-foreground mt-2">
                        새로운 가상 머신 인스턴스를 생성합니다. 필요한 사양을 선택하고 이름을 지정해주세요.
                    </p>
                </header>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>인스턴스 이름</CardTitle>
                            <CardDescription>
                                인스턴스의 호스트 이름으로 사용됩니다. 생성 후에는 변경할 수 없습니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="instance-name" className="sr-only">인스턴스 이름</Label>
                            <Input
                                id="instance-name"
                                placeholder="my-new-instance"
                                value={instanceName}
                                onChange={(e) => setInstanceName(e.target.value)}
                                className="max-w-sm"
                            />
                            <div className="text-sm text-muted-foreground mt-2">
                                * 영어 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>성능 선택 (Flavor)</CardTitle>
                            <CardDescription>
                                인스턴스에 할당할 CPU, RAM, 디스크 용량을 선택합니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {loading ? (
                                    <p>성능 옵션을 불러오는 중입니다...</p>
                                ) : flavors.length > 0 ? (
                                    flavors.map((flavor) => (
                                        <div
                                            key={flavor.id}
                                            onClick={() => { setSelectedFlavor(flavor.id); setcinervolume(String(flavor.disk)) }}
                                            className={cn(
                                                "p-4 border rounded-lg cursor-pointer transition-all",
                                                selectedFlavor === flavor.id
                                                    ? "border-primary ring-2 ring-primary"
                                                    : "hover:border-foreground/30"
                                            )}
                                        >
                                            <h3 className="font-semibold text-lg">{flavor.name}</h3>
                                            <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                                <p>VCPUs: {flavor.vcpus}</p>
                                                <p>RAM: {flavor.ram / 1024} GB</p>
                                                <p>Disk: {flavor.disk} GB</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>사용 가능한 성능 옵션이 없습니다.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>운영체제 (OS) 및 네트워크 선택</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <Label htmlFor="os-select">운영체제</Label>
                                <select
                                    id="os-select"
                                    value={selectedImage}
                                    onChange={(e) => setSelectedImage(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-background mt-1"
                                    disabled={loading || images.length === 0}
                                >
                                    {images.map((image) => (
                                        <option key={image.id} value={image.id}>
                                            {image.name}
                                        </option>
                                    ))}
                                </select>
                                {images.length === 0 && !loading && <p className="text-sm text-muted-foreground mt-2">사용 가능한 이미지가 없습니다.</p>}
                            </div>
                            <div>
                                <Label htmlFor="network-select">네트워크</Label>
                                <select
                                    id="network-select"
                                    value={selectedNetwork}
                                    onChange={(e) => setSelectedNetwork(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-background mt-1"
                                    disabled={loading || networks.length === 0}
                                >
                                    {networks.map((network) => (
                                        <option key={network.id} value={network.id}>
                                            {network.name}
                                        </option>
                                    ))}
                                </select>
                                {networks.length === 0 && !loading && <p className="text-sm text-muted-foreground mt-2">사용 가능한 네트워크가 없습니다.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>키페어 선택</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="keypair-select" className="sr-only">키페어 선택</Label>
                                <select
                                    id="keypair-select"
                                    value={selectedKeypair}
                                    onChange={(e) => setSelectedKeypair(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-background"
                                    disabled={loading || keypairs.length === 0}
                                >
                                    {keypairs.map((keypair) => (
                                        <option key={keypair.name} value={keypair.name}>
                                            {keypair.name}
                                        </option>
                                    ))}
                                </select>
                                {keypairs.length === 0 && !loading && <p className="text-sm text-muted-foreground mt-2">사용 가능한 키페어가 없습니다.</p>}
                                <p className="text-sm text-muted-foreground mt-2">*키페어는 SSH로 접속할때 자기자신을 인증하는 보안키입니다.</p>
                                <p className="text-sm text-muted-foreground mt-2">*만약 생성후 키페어를 분실한경우 다시 VM을 재생성 해야할수 있습니다.</p>

                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>포트포워딩 설정</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">SSH 포트(22)는 자동으로 포워딩됩니다.</p>
                                <div className="mt-4 space-y-2">
                                    <h4 className="font-semibold">추가 포트</h4>
                                    {additionalPorts.map((port, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input value={port.external} readOnly className="w-24" />
                                            <span>:</span>
                                            <Input value={port.internal} readOnly className="w-24" />
                                            <Button variant="destructive" size="sm" onClick={() => handleRemovePort(index)}>삭제</Button>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            placeholder="외부 포트"
                                            value={newExternalPort}
                                            onChange={(e) => setNewExternalPort(e.target.value)}
                                            className="w-24"
                                        />
                                        <span>:</span>
                                        <Input
                                            placeholder="내부 포트"
                                            value={newInternalPort}
                                            onChange={(e) => setNewInternalPort(e.target.value)}
                                            className="w-24"
                                        />
                                        <Button onClick={handleAddPort}>추가</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Button size="lg" onClick={handleCreateInstance} disabled={loading}>
                            인스턴스 생성
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}