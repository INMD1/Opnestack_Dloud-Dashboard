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
import { Check, HardDrive, MemoryStick, Layers, Tag, Clock, ShieldCheck, ArrowRight, ArrowLeft, Rocket } from "lucide-react";

import { components } from "@/lib/skyline-api";

const STEPS = [
    { id: 1, title: "이름 및 OS" },
    { id: 2, title: "Flavor" },
    { id: 3, title: "네트워크 & 키" },
    { id: 4, title: "최종 확인" },
];

export default function InstanceCreatePage() {
    const [currentStep, setCurrentStep] = useState(1);

    const [flavors, setFlavors] = useState<components["schemas"]["Flavor"][]>([]);
    const [images, setImages] = useState<components["schemas"]["Image"][]>([]);
    const [keypairs, setKeypairs] = useState<components["schemas"]["Keypair"][]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [networks, setNetworks] = useState<any[]>([]);

    const [instanceName, setInstanceName] = useState("");
    const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
    const [cinervolume, setcinervolume] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedKeypair, setSelectedKeypair] = useState<string>("");
    const [selectedNetwork, setSelectedNetwork] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [existingInstanceNames, setExistingInstanceNames] = useState<string[]>([]);
    const [additionalPorts, setAdditionalPorts] = useState<{ external: string, internal: string }[]>([]);
    const [newExternalPort, setNewExternalPort] = useState("");
    const [newInternalPort, setNewInternalPort] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<components["schemas"]["Image"] | null>(null);

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
                const [flavorsRes, imagesRes, keypairsRes, networksRes, instancesRes] = await Promise.all([
                    fetch("/api/v1/flavors").then(res => res.json()),
                    fetch("/api/v1/images").then(res => res.json()),
                    fetch("/api/v1/keypairs").then(res => res.json()),
                    fetch("/api/v1/networks").then(res => res.json()),
                    fetch("/api/v1/extension/servers").then(res => res.json()),
                ]);

                if (flavorsRes && flavorsRes.flavors) {
                    const sorted = [...flavorsRes.flavors].sort((a: components["schemas"]["Flavor"], b: components["schemas"]["Flavor"]) => {
                        if (a.vcpus !== b.vcpus) return a.vcpus - b.vcpus;
                        if (a.ram !== b.ram) return a.ram - b.ram;
                        return a.disk - b.disk;
                    });
                    setFlavors(sorted);
                }
                if (imagesRes && imagesRes.images) {
                    setImages(imagesRes.images);
                    if (imagesRes.images.length > 0) {
                        setSelectedImage(imagesRes.images[0].id);
                        setPreviewImage(imagesRes.images[0]);
                    }
                }
                if (keypairsRes && keypairsRes.keypairs) {
                    setKeypairs(keypairsRes.keypairs);
                }
                if (networksRes && networksRes.networks) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const filteredNetworks = networksRes.networks.filter((network: any) => network.name === 'private-net');
                    setNetworks(filteredNetworks);
                    if (filteredNetworks.length > 0) setSelectedNetwork(filteredNetworks[0].id!);
                }
                if (instancesRes && instancesRes.servers) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setExistingInstanceNames(instancesRes.servers.map((s: any) => s.name));
                }

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const canGoNext = () => {
        if (currentStep === 1) {
            return instanceName.trim() !== "" &&
                !existingInstanceNames.includes(instanceName) &&
                selectedImage !== "";
        }
        if (currentStep === 2) return selectedFlavor !== null;
        if (currentStep === 3) return selectedNetwork !== "";
        return true;
    };

    const handleNext = () => {
        if (canGoNext()) setCurrentStep(s => s + 1);
    };

    const handlePrev = () => {
        setCurrentStep(s => s - 1);
    };

    const handleCreateInstance = async () => {
        const portForwardings = additionalPorts.map(p => ({
            internal_port: parseInt(p.internal, 10),
            external_port: parseInt(p.external, 10),
            protocol: "tcp"
        })).filter(p => !isNaN(p.external_port) && !isNaN(p.internal_port));

        const osName = images.find((image) => image.id === selectedImage)?.name;

        const instanceData = {
            name: instanceName,
            image_id: selectedImage,
            flavor_id: selectedFlavor,
            key_name: selectedKeypair || null,
            network_id: selectedNetwork,
            additional_ports: portForwardings,
            volume_size: cinervolume,
            os_name: osName ? osName : "Undefined"
        };

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/v1/instances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(instanceData),
            });

            if (res.status === 202) {
                const building = JSON.parse(localStorage.getItem('buildingInstances') || '[]') as string[];
                building.push(instanceName);
                localStorage.setItem('buildingInstances', JSON.stringify(building));
                const encodedName = encodeURIComponent(instanceName);
                window.location.href = `/console/instance/${encodedName}/status`;
            } else if (res.status === 409) {
                const error = await res.json();
                alert(error.detail || '이미 동일한 이름의 인스턴스가 존재합니다.');
            } else {
                const error = await res.json();
                alert(`인스턴스 생성 요청 실패: ${error.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("Instance creation failed:", error);
            alert("인스턴스 생성 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedFlavorInfo = flavors.find(f => f.id === selectedFlavor);
    const selectedImageInfo = images.find(i => i.id === selectedImage);
    const selectedNetworkInfo = networks.find(n => n.id === selectedNetwork);

    return (
        <div className="flex gap-0 min-h-screen bg-[#10131a]">
            {/* 메인 콘텐츠 */}
            <div className={cn(
                "flex-1 min-w-0 p-4 sm:p-6 lg:p-10 transition-all", 
                (currentStep === 1 || currentStep === 4) ? "lg:mr-80 xl:mr-96" : ""
            )}>
                <div className="max-w-5xl mx-auto">
                    <header className="mb-6 sm:mb-10">
                        <div className="flex items-center gap-2 text-[#b0c6ff] mb-2">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Step {currentStep} of 4</span>
                            <span className="h-px w-8 sm:w-12 bg-[#b0c6ff]/20"></span>
                            <span className="text-[10px] sm:text-xs font-medium text-[#c2c6d7] uppercase tracking-wider">
                                {STEPS.find(s => s.id === currentStep)?.title}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#e1e2eb]">
                            {currentStep === 4 ? "Review & Launch" : "인스턴스 생성"}
                        </h1>
                        <div className="w-full bg-[#32353c] h-1 rounded-full overflow-hidden mt-4">
                            <div 
                                className="bg-[#b0c6ff] h-full transition-all duration-700 ease-in-out" 
                                style={{ width: `${(currentStep / 4) * 100}%` }}
                            ></div>
                        </div>
                    </header>

                    {/* Step 1: 이름 및 OS 선택 */}
                    {currentStep === 1 && (
                        <div className="space-y-6 max-w-3xl">
                            <Card className="bg-[#191c22] border-[#424655]/20 shadow-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg sm:text-xl text-[#e1e2eb]">인스턴스 이름</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-[#c2c6d7]/60">
                                        인스턴스의 호스트 이름입니다. 소문자, 숫자, 하이픈(-)만 가능합니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        id="instance-name"
                                        placeholder="instance-01"
                                        value={instanceName}
                                        onChange={(e) => setInstanceName(e.target.value)}
                                        className={cn(
                                            "max-w-md bg-[#10131a] border-[#424655]/40 text-[#e1e2eb] focus:border-[#b0c6ff]/50 transition-colors",
                                            instanceName && existingInstanceNames.includes(instanceName) ? 'border-red-500/50 focus:border-red-500' : ''
                                        )}
                                    />
                                    {instanceName && existingInstanceNames.includes(instanceName) && (
                                        <p className="text-[11px] text-red-400 mt-2 font-medium">이미 존재하는 인스턴스 이름입니다.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-[#191c22] border-[#424655]/20 shadow-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg sm:text-xl text-[#e1e2eb]">운영체제 이미지</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-[#c2c6d7]/60">설치할 운영체제를 선택하세요.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-[#c2c6d7]/40 py-4">
                                            <div className="w-4 h-4 border-2 border-[#b0c6ff] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm">이미지 로딩 중...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {images.map((image) => (
                                                <div
                                                    key={image.id}
                                                    onClick={() => {
                                                        setSelectedImage(image.id);
                                                        setPreviewImage(image);
                                                    }}
                                                    className={cn(
                                                        "p-4 border rounded-xl cursor-pointer transition-all bg-[#10131a] relative group",
                                                        selectedImage === image.id
                                                            ? "border-[#b0c6ff] ring-1 ring-[#b0c6ff]/30 bg-[#b0c6ff]/5"
                                                            : "border-[#424655]/30 hover:border-[#b0c6ff]/40"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                            selectedImage === image.id ? "bg-[#b0c6ff] text-[#001945]" : "bg-[#191c22] text-[#c2c6d7]/40 group-hover:text-[#b0c6ff]"
                                                        )}>
                                                            <Layers className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-sm text-[#e1e2eb] truncate">{image.name}</p>
                                                            <p className="text-[10px] text-[#c2c6d7]/40 uppercase tracking-tighter">OS Image</p>
                                                        </div>
                                                        {selectedImage === image.id && (
                                                            <div className="absolute top-2 right-2">
                                                                <Check className="w-4 h-4 text-[#b0c6ff]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 2: Flavor 선택 */}
                    {currentStep === 2 && (
                        <div className="space-y-6 max-w-4xl">
                            <header className="mb-4">
                                <h2 className="text-xl font-bold text-[#e1e2eb]">성능 옵션 (Flavor)</h2>
                                <p className="text-sm text-[#c2c6d7]/60">용도에 맞는 가상 머신 사양을 선택하세요.</p>
                            </header>
                            
                            {loading ? (
                                <div className="flex items-center gap-2 text-[#c2c6d7]/40 py-10">
                                    <div className="w-5 h-5 border-2 border-[#b0c6ff] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm">성능 옵션 로딩 중...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {flavors.map((flavor) => (
                                        <div
                                            key={flavor.id}
                                            onClick={() => { setSelectedFlavor(flavor.id); setcinervolume(String(flavor.disk)); }}
                                            className={cn(
                                                "p-5 border rounded-2xl cursor-pointer transition-all bg-[#191c22] relative overflow-hidden group",
                                                selectedFlavor === flavor.id
                                                    ? "border-[#b0c6ff] ring-1 ring-[#b0c6ff]/30 shadow-lg shadow-[#b0c6ff]/5"
                                                    : "border-[#424655]/30 hover:border-[#b0c6ff]/40"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-[#e1e2eb]">{flavor.name}</h3>
                                                {selectedFlavor === flavor.id && (
                                                    <span className="bg-[#b0c6ff] text-[#001945] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Selected</span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-[#10131a] p-2 rounded-lg text-center">
                                                    <p className="text-[9px] text-[#c2c6d7]/40 uppercase font-black">vCPU</p>
                                                    <p className="text-sm font-bold text-[#b0c6ff]">{flavor.vcpus}</p>
                                                </div>
                                                <div className="bg-[#10131a] p-2 rounded-lg text-center">
                                                    <p className="text-[9px] text-[#c2c6d7]/40 uppercase font-black">RAM</p>
                                                    <p className="text-sm font-bold text-[#b0c6ff]">{flavor.ram / 1024}G</p>
                                                </div>
                                                <div className="bg-[#10131a] p-2 rounded-lg text-center">
                                                    <p className="text-[9px] text-[#c2c6d7]/40 uppercase font-black">Disk</p>
                                                    <p className="text-sm font-bold text-[#b0c6ff]">{flavor.disk}G</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: 네트워크 및 키 선택 */}
                    {currentStep === 3 && (
                        <div className="space-y-6 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-[#191c22] border-[#424655]/20 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-[#e1e2eb]">네트워크</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <select
                                            id="network-select"
                                            value={selectedNetwork}
                                            onChange={(e) => setSelectedNetwork(e.target.value)}
                                            className="w-full p-3 border border-[#424655]/40 rounded-xl bg-[#10131a] text-[#e1e2eb] focus:ring-2 focus:ring-[#b0c6ff]/20 focus:border-[#b0c6ff] outline-none transition-all appearance-none"
                                            disabled={loading || networks.length === 0}
                                        >
                                            {networks.map((network) => (
                                                <option key={network.id} value={network.id}>
                                                    {network.name}
                                                </option>
                                            ))}
                                        </select>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#191c22] border-[#424655]/20 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-[#e1e2eb]">SSH 키페어</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <select
                                            id="keypair-select"
                                            value={selectedKeypair}
                                            onChange={(e) => setSelectedKeypair(e.target.value)}
                                            className="w-full p-3 border border-[#424655]/40 rounded-xl bg-[#10131a] text-[#e1e2eb] focus:ring-2 focus:ring-[#b0c6ff]/20 focus:border-[#b0c6ff] outline-none transition-all appearance-none"
                                            disabled={loading}
                                        >
                                            <option value="">없음 (비밀번호 로그인)</option>
                                            {keypairs.map((keypair) => (
                                                <option key={keypair.name} value={keypair.name}>
                                                    {keypair.name}
                                                </option>
                                            ))}
                                        </select>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-[#191c22] border-[#424655]/20 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#e1e2eb]">포트포워딩 설정</CardTitle>
                                    <CardDescription className="text-xs text-[#c2c6d7]/60">내부 서비스에 접근하기 위한 외부 포트를 매핑합니다.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#b0c6ff] bg-[#b0c6ff]/5 p-2 rounded-lg border border-[#b0c6ff]/10">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        SSH 포트 (22)는 자동으로 포워딩됩니다.
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {additionalPorts.map((port, index) => (
                                            <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 sm:gap-4 bg-[#10131a] p-2 rounded-xl border border-[#424655]/20">
                                                <div className="text-center">
                                                    <p className="text-[9px] text-[#c2c6d7]/40 uppercase font-black mb-1">External</p>
                                                    <p className="text-sm font-bold text-[#e1e2eb]">{port.external}</p>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-[#c2c6d7]/20" />
                                                <div className="text-center">
                                                    <p className="text-[9px] text-[#c2c6d7]/40 uppercase font-black mb-1">Internal</p>
                                                    <p className="text-sm font-bold text-[#e1e2eb]">{port.internal}</p>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleRemovePort(index)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </Button>
                                            </div>
                                        ))}
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] items-end gap-3 pt-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] uppercase font-black text-[#c2c6d7]/40 ml-1">외부 포트</Label>
                                                <Input
                                                    placeholder="e.g. 8080"
                                                    value={newExternalPort}
                                                    onChange={(e) => setNewExternalPort(e.target.value)}
                                                    className="bg-[#10131a] border-[#424655]/40 text-[#e1e2eb]"
                                                />
                                            </div>
                                            <div className="hidden sm:block pb-3">
                                                <ArrowRight className="w-4 h-4 text-[#c2c6d7]/20" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] uppercase font-black text-[#c2c6d7]/40 ml-1">내부 포트</Label>
                                                <Input
                                                    placeholder="e.g. 80"
                                                    value={newInternalPort}
                                                    onChange={(e) => setNewInternalPort(e.target.value)}
                                                    className="bg-[#10131a] border-[#424655]/40 text-[#e1e2eb]"
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleAddPort} 
                                                className="bg-[#b0c6ff]/10 text-[#b0c6ff] border border-[#b0c6ff]/20 hover:bg-[#b0c6ff] hover:text-[#001945] transition-all"
                                            >
                                                추가
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 4: 최종 확인 */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <section className="bg-[#191c22] rounded-2xl p-6 border border-[#424655]/20 relative overflow-hidden group">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#b0c6ff]/5 rounded-full blur-3xl group-hover:bg-[#b0c6ff]/10 transition-all"></div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/40 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">id_card</span>
                                        Instance Info
                                    </h2>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-1">Name</p>
                                            <p className="text-xl font-bold text-[#b0c6ff] truncate">{instanceName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-[#10131a] text-[9px] font-black text-[#c2c6d7]/60 rounded-md border border-[#424655]/20 uppercase">Environment: Production</span>
                                            <span className="px-2 py-1 bg-[#10131a] text-[9px] font-black text-[#c2c6d7]/60 rounded-md border border-[#424655]/20 uppercase">Dept: Engineering</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-[#191c22] rounded-2xl p-6 border border-[#424655]/20 relative overflow-hidden group">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#b0c6ff]/5 rounded-full blur-3xl group-hover:bg-[#b0c6ff]/10 transition-all"></div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/40 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">settings_input_component</span>
                                        OS & Hardware
                                    </h2>
                                    <div className="space-y-5">
                                        <div className="flex justify-between items-center bg-[#10131a] p-3 rounded-xl border border-[#424655]/20">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-0.5">Operating System</p>
                                                <p className="font-bold text-[#e1e2eb] text-sm truncate">{selectedImageInfo?.name ?? "-"}</p>
                                            </div>
                                            <Check className="w-5 h-5 text-[#b0c6ff] shrink-0" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-1">Flavor</p>
                                            <p className="font-bold text-[#e1e2eb] mb-1">{selectedFlavorInfo?.name ?? "-"}</p>
                                            <div className="flex gap-3 text-[10px] font-bold text-[#c2c6d7]/40">
                                                <span>{selectedFlavorInfo?.vcpus} VCPUS</span>
                                                <span className="w-1 h-1 bg-[#424655] rounded-full mt-1.5"></span>
                                                <span>{selectedFlavorInfo ? (selectedFlavorInfo.ram / 1024) : 0} GB RAM</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-[#191c22] rounded-2xl p-6 border border-[#424655]/20 relative overflow-hidden md:col-span-2 group">
                                    <div className="absolute -top-4 -right-4 w-40 h-40 bg-[#b0c6ff]/5 rounded-full blur-3xl group-hover:bg-[#b0c6ff]/10 transition-all"></div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/40 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">lan</span>
                                        Connectivity
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-[#10131a]/50 p-4 rounded-xl border border-[#424655]/10">
                                            <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-1">Network</p>
                                            <p className="font-bold text-[#e1e2eb] text-sm">{selectedNetworkInfo?.name ?? "-"}</p>
                                            <p className="text-[10px] text-[#c2c6d7]/40 mt-1 uppercase tracking-tighter">Private Subnet</p>
                                        </div>
                                        <div className="bg-[#10131a]/50 p-4 rounded-xl border border-[#424655]/10">
                                            <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-1">Access Method</p>
                                            <p className="font-bold text-[#e1e2eb] text-sm">{selectedKeypair ? "SSH Keypair" : "Password Auth"}</p>
                                            <p className="text-[10px] text-[#b0c6ff] mt-1 uppercase tracking-tighter font-black truncate">{selectedKeypair || "Encrypted"}</p>
                                        </div>
                                        <div className="bg-[#10131a]/50 p-4 rounded-xl border border-[#424655]/10">
                                            <p className="text-[9px] font-black text-[#c2c6d7]/30 uppercase tracking-widest mb-1">Public IP</p>
                                            <p className="font-bold text-red-400 text-sm">Disabled</p>
                                            <p className="text-[10px] text-[#c2c6d7]/40 mt-1 uppercase tracking-tighter">Private Only</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-[#191c22] rounded-2xl p-6 border border-[#424655]/20 relative overflow-hidden md:col-span-2 group">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/40 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">security</span>
                                        Firewall & Ports
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-[#b0c6ff]/10 text-[#b0c6ff] border border-[#b0c6ff]/20 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-2">
                                            <Check className="w-3 h-3" /> SSH:22 (Default)
                                        </span>
                                        {additionalPorts.map((port, i) => (
                                            <span key={i} className="bg-[#10131a] text-[#e1e2eb] border border-[#424655]/40 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-2">
                                                <Layers className="w-3 h-3 text-[#c2c6d7]/40" /> TCP:{port.internal} → {port.external}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="mt-10 p-6 sm:p-10 border border-[#b0c6ff]/20 rounded-3xl bg-gradient-to-br from-[#b0c6ff]/10 via-[#10131a] to-[#10131a] flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#b0c6ff]/5 rounded-full blur-[100px] pointer-events-none"></div>
                                <div className="flex items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                                    <div className="w-16 h-16 rounded-2xl bg-[#b0c6ff] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(176,198,255,0.3)]">
                                        <Rocket className="w-8 h-8 text-[#001945]" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#e1e2eb] uppercase tracking-tight">Launch Ready</h3>
                                        <p className="text-sm text-[#c2c6d7]/60 mt-1 max-w-sm">모든 설정이 완료되었습니다. 버튼을 누르면 인스턴스 프로비저닝이 시작됩니다.</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleCreateInstance} 
                                    disabled={isSubmitting || loading}
                                    className="w-full lg:w-auto px-12 py-8 bg-[#b0c6ff] hover:bg-[#b0c6ff]/90 text-[#001945] font-black text-base uppercase tracking-widest rounded-2xl shadow-[0_15px_30px_-5px_rgba(176,198,255,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all relative z-10"
                                >
                                    {isSubmitting ? "Provisioning..." : "Launch Instance"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* 하단 네비게이션 (Step 4 제외) */}
                    {currentStep < 4 && (
                        <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#424655]/10 max-w-3xl">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                                className="text-[#c2c6d7]/40 hover:text-[#e1e2eb] hover:bg-transparent transition-all gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-widest text-xs">Back</span>
                            </Button>

                            <Button 
                                onClick={handleNext} 
                                disabled={!canGoNext() || loading}
                                className="bg-[#b0c6ff] text-[#001945] hover:bg-[#b0c6ff]/90 px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#b0c6ff]/10 gap-2"
                            >
                                <span className="font-bold">Next</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    
                    {/* Step 4 전용 하단 링크 */}
                    {currentStep === 4 && (
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                className="text-[#c2c6d7]/40 hover:text-[#e1e2eb] transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Back to Settings</span>
                            </Button>
                            <p className="text-[9px] text-[#c2c6d7]/20 max-w-xs text-center sm:text-right font-medium uppercase leading-relaxed tracking-tighter">
                                By launching, you agree to the DCloud Terms of Service and Resource Fair Use Policy.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 오른쪽 고정 패널 (Lg 이상에서만 표시) */}
            {(currentStep === 1 || currentStep === 4) && (
                <aside className="hidden lg:flex fixed top-16 right-0 h-[calc(100vh-64px)] w-80 xl:w-96 border-l border-[#424655]/10 bg-[#10131a] flex-col z-30 overflow-y-auto">
                    {currentStep === 1 ? (
                        <>
                            <div className="px-6 py-8 border-b border-[#424655]/10">
                                <p className="font-black text-[#e1e2eb] text-[10px] uppercase tracking-[0.3em]">Image Specifications</p>
                                <p className="text-[10px] text-[#c2c6d7]/30 mt-1 uppercase">Technical metadata for selected OS</p>
                            </div>

                            {previewImage ? (
                                <div className="flex flex-col flex-1">
                                    {/* OS 이름 + 상태 */}
                                    <div className="px-6 py-8 border-b border-[#424655]/10 bg-[#191c22]/30">
                                        <p className="font-black text-xl text-[#b0c6ff] leading-none tracking-tight">{previewImage.name}</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                                previewImage.status === "active"
                                                    ? "bg-[#b0c6ff]/10 text-[#b0c6ff] border border-[#b0c6ff]/20"
                                                    : "bg-red-400/10 text-red-400 border border-red-400/20"
                                            )}>
                                                {previewImage.status === "active" ? "Available" : previewImage.status}
                                            </span>
                                            {previewImage.protected && (
                                                <span className="flex items-center gap-1 text-[9px] text-[#c2c6d7]/40 font-black uppercase tracking-widest">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 상세 항목 */}
                                    <div className="divide-y divide-[#424655]/10 flex-1">
                                        {[
                                            { icon: <Layers className="w-3.5 h-3.5" />, label: "Size", value: previewImage.size ? (previewImage.size >= 1024 * 1024 * 1024 ? `${(previewImage.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : `${(previewImage.size / (1024 * 1024)).toFixed(1)} MB`) : "-" },
                                            { icon: <HardDrive className="w-3.5 h-3.5" />, label: "Min Disk", value: previewImage.min_disk > 0 ? `${previewImage.min_disk} GB` : "No Limit" },
                                            { icon: <MemoryStick className="w-3.5 h-3.5" />, label: "Min RAM", value: previewImage.min_ram > 0 ? `${previewImage.min_ram} MB` : "No Limit" },
                                            { icon: <Layers className="w-3.5 h-3.5" />, label: "Format", value: previewImage.disk_format?.toUpperCase() || "-" },
                                            { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Visibility", value: previewImage.visibility === "public" ? "Public" : "Private" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 px-6 py-5 hover:bg-[#191c22]/20 transition-colors">
                                                <span className="text-[#b0c6ff]/40 shrink-0">{item.icon}</span>
                                                <div className="flex justify-between w-full">
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-[#c2c6d7]/30">{item.label}</span>
                                                    <span className="text-xs font-bold text-[#e1e2eb]">{item.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {previewImage.tags && previewImage.tags.length > 0 && (
                                            <div className="px-6 py-5">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <Tag className="w-3.5 h-3.5 text-[#b0c6ff]/40 shrink-0" />
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-[#c2c6d7]/30">Metadata Tags</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 ml-8">
                                                    {previewImage.tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-[#191c22] border border-[#424655]/20 rounded text-[9px] font-bold text-[#c2c6d7]/40 uppercase">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-16 h-16 bg-[#191c22] rounded-3xl flex items-center justify-center mb-6 border border-[#424655]/10">
                                        <Layers className="w-8 h-8 text-[#c2c6d7]/10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/20 leading-loose">Select an image to<br />inspect system details</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Step 4: Configuration Summary */
                        <div className="p-6 xl:p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c2c6d7]/40 mb-10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">summarize</span>
                                Resource Summary
                            </h3>
                            <div className="space-y-10">
                                <div className="space-y-5">
                                    {[
                                        { label: "서버 자원", value: `${selectedFlavorInfo?.vcpus ?? 0} vCPUs / ${selectedFlavorInfo ? (selectedFlavorInfo.ram / 1024) : 0} GB` },
                                        { label: "스토리지 용량", value: `${selectedFlavorInfo?.disk ?? 0} GB HDD` },
                                        { label: "네트워크", value: selectedNetworkInfo?.name || "D-NET-01" },
                                        { label: "인증", value: selectedKeypair ? "SSH-RSA" : "Credentials" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-end border-b border-[#424655]/10 pb-2">
                                            <span className="text-[9px] text-[#c2c6d7]/30 font-black uppercase tracking-widest">{item.label}</span>
                                            <span className="text-xs font-bold text-[#e1e2eb]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-3 pt-6">
                                    <div className="bg-[#191c22]/50 p-5 rounded-2xl border border-[#424655]/20 group hover:border-[#b0c6ff]/20 transition-all">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/30 mb-4">Node Health</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                                            <span className="text-[10px] font-black text-[#e1e2eb] uppercase tracking-widest">Active Monitoring</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#191c22]/50 p-5 rounded-2xl border border-[#424655]/20 group hover:border-[#b0c6ff]/20 transition-all">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c2c6d7]/30 mb-4">Availability</h4>
                                        <div className="flex items-center gap-3 text-[#b0c6ff]">
                                            <span className="material-symbols-outlined text-base">verified_user</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">99.9% Uptime SLA</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="rounded-2xl overflow-hidden relative group border border-[#424655]/20">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-[#10131a]/40 to-transparent z-10"></div>
                                        <img 
                                            className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-40 grayscale group-hover:grayscale-0" 
                                            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2000&auto=format&fit=crop" 
                                            alt="Server Node"
                                        />
                                        <div className="absolute bottom-5 left-5 z-20">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b0c6ff] bg-[#b0c6ff]/10 px-2 py-0.5 rounded">Infra Node 09</span>
                                            <p className="text-[10px] text-[#e1e2eb]/40 font-bold uppercase mt-2 tracking-tighter">Cluster: US-EAST-DLOUD</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto py-10 flex flex-col items-center gap-3 border-t border-[#424655]/10 mt-10">
                                <div className="flex items-center gap-2 text-[#b0c6ff]/40">
                                    <span className="material-symbols-outlined text-sm">lock</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">AES-256 Provisioning</span>
                                </div>
                                <p className="text-[8px] text-[#c2c6d7]/10 text-center uppercase font-medium tracking-[0.1em]">
                                    Secure Socket Layer v3.0 Deployment Active
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            )}
        </div>
    );
}
