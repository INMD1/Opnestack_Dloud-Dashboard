"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSession } from "next-auth/react";

//Icons
import { VscVm } from "react-icons/vsc";
import { PiNetwork } from "react-icons/pi";
import { GrStorage } from "react-icons/gr";
import { IoRefresh } from "react-icons/io5";
import { HiComputerDesktop } from "react-icons/hi2";
import { FaRegClock } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import React from "react";
import StatCard from "../exten/StatCard";
import { components } from "@/lib/skyline-api";
import { HardDrive, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const welcomeMessages = [
  "환영합니다! 새로운 시작을 함께해요 🚀",
  "어서 오세요! 기다리고 있었어요 👋",
  "환영해요! 즐거운 시간 보내세요 🎉",
];

const mockActivity = [
  { description: "인스턴스 'web-server-01'이 생성되었습니다.", timestamp: "5분 전" },
  { description: "디스크 'db-data-disk'가 'db-server-01'에 연결되었습니다.", timestamp: "1시간 전" },
  { description: "포트포워딩 규칙 (8080 -> 80)이 추가되었습니다.", timestamp: "3시간 전" },
  { description: "인스턴스 'test-instance'가 삭제되었습니다.", timestamp: "1일 전" },
];

const prettyKey = (key: keyof components["schemas"]["QuotaSet"]) => {
  const map: Record<keyof components["schemas"]["QuotaSet"], string> = {
    instances: "인스턴스",
    cores: "CPU 코어",
    ram: "램(MB)",
    volumes: "디스크 볼륨",
    snapshots: "스냅샷",
    gigabytes: "총 사용량(GB)",
    floatingip: "외부 IP 할당",
    network: "네트워크",
    port: "포트",
    router: "라우터",
    subnet: "서브넷",
    security_group: "Security Groups",
    security_group_rule: "Sec. Group Rules",
    port_forwardings: "포트포워딩"
  };
  return map[key];
};

interface Quota {
  in_use: number;
  limit: number;
  reserved: number;
}

function toDonutData(q: Quota) {
  const inUse = Math.max(0, q.in_use);
  const reserved = Math.max(0, q.reserved);
  const limit = Math.max(0, q.limit);
  const available = Math.max(0, limit - inUse - reserved);
  const total = Math.max(1, inUse + reserved + available); // avoid 0 total
  return {
    chart: [
      { name: "In use", value: inUse },
      { name: "Reserved", value: reserved },
      { name: "Available", value: available },
    ],
    pct: (inUse / total) * 100,
    inUse,
    reserved,
    available,
    limit,
  };
}

const COLORS = ["#3b82f6", "#f59e0b", "#e5e7eb"];

const DonutCard: React.FC<{ title: string; quota: Quota }> = ({ title, quota }) => {
  const { chart, pct, limit } = toDonutData(quota);
  return (
    <div className="grid items-center gap-4">
      <div className="flex items-center">
        <div className="w-32 h-30 mr-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart}
                dataKey="value"
                nameKey="name"
                innerRadius={38}
                outerRadius={56}
                startAngle={90}
                endAngle={-270}
                isAnimationActive
              >
                {chart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          {title}
          <div className="text-3xl font-semibold leading-tight">{pct.toFixed(0)}%</div>
          <div className="text-xs text-gray-500">In use of {limit}</div>
        </div>
      </div>
    </div>
  );
}


export default function ConsolePage() {

  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [limits, setLimits] = useState<components["schemas"]["QuotaSet"] | null>(null);
  let isLoading = false

  const entries = Object.entries(limits ?? {}).filter(([key]) => !["subnet", "security_group", "floatingip", "port", "router", "security_group_rule"].includes(key)) as [keyof components["schemas"]["QuotaSet"], Quota][];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);

    async function fetchData() {
      try {
        const res = await fetch("/api/v1/limits");
        const data = await res.json();
        setLimits(data.quotas);
        isLoading = true
      } catch (error) {
        console.error("Error fetching limits:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className=" mx-auto px-14 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            안녕하세요, {session?.user?.name || "사용자"}님! 👋
          </h1>
          <p className="text-lg text-gray-600 mt-1">{message}</p>
        </div>
        <div className="flex items-center gap-x-3">
          <a href="/console/instance/create">
            <Button variant="outline" className="flex items-center gap-2">
              <HiComputerDesktop />
              VM 생성
            </Button>
          </a>
          <a href="/console/disk/view">
            <Button variant="outline" className="flex items-center gap-2">
              <GrStorage />
              디스크 생성
            </Button>
          </a>
          <a href="/console/network/view">
            <Button variant="outline" className="flex items-center gap-2">
              <PiNetwork />
              네트워크 관리
            </Button>
          </a>
          <Button variant="outline" className="flex items-center gap-2">
            <IoRefresh />
            새로고침
          </Button>
        </div>
      </div>
      <section>
        <h2 className="text-2xl font-bold mb-4">사용량 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<VscVm className="text-4xl text-blue-500" />}
            title="인스턴스"
            isLoading={isLoading} value={undefined} unit={undefined} children={undefined}          >
            {limits ? (
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {limits.instances.in_use} / {limits.instances.limit}
                <span className="text-xl font-medium text-gray-600"> 개</span>
              </p>
            ) : (
              <p className="text-xl text-gray-500 mt-1">데이터 없음</p>
            )}
          </StatCard>

          <StatCard
            icon={<PiNetwork className="text-4xl text-green-500" />}
            title="포트포워딩 개수"
            isLoading={isLoading}
          >
            {limits ? (
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {limits.port_forwardings.in_use} / {limits.port_forwardings.limit}
                <span className="text-xl font-medium text-gray-600"> 개</span>
              </p>
            ) : (
              <p className="text-xl text-gray-500 mt-1">데이터 없음</p>
            )}
          </StatCard>

          <StatCard
            icon={<GrStorage className="text-4xl text-purple-500" />}
            title="Disk 사용량"
            isLoading={isLoading}
          >
            {limits ? (
              <div className="flex flex-col">
                <p className="text-xl font-semibold text-gray-700">{limits.volumes.in_use} 개</p>
                <p className="text-lg text-gray-500">({limits.gigabytes.in_use} GB)</p>
              </div>
            ) : (
              <p className="text-xl text-gray-500 mt-1">데이터 없음</p>
            )}
          </StatCard>

        </div>
      </section>
      <section>
        {/* 최근 활동 */}
        <div className="w-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>계정의 최근 활동 내역입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-muted rounded-full p-2">
                      <FaRegClock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">계정 한도 및 최근 활동</h2>
        <div className="">
          {isLoading ? (
            <p>계정 한도 정보를 불러오는 중입니다...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {entries.map(([key, quota]) => (
                <DonutCard key={key} title={prettyKey(key)} quota={quota} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
