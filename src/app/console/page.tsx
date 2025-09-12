"use client";

import {
  Card,
} from "@/components/ui/card"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

//Icons
import { VscVm } from "react-icons/vsc";
import { PiNetwork } from "react-icons/pi";
import { GrStorage } from "react-icons/gr";
import { IoRefresh } from "react-icons/io5";
import { HiComputerDesktop } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import React from "react";
import StatCard from "../exten/StatCard";

interface Quota {
  in_use: number;
  limit: number;
  reserved: number;
}

interface Quotas {
  instances: Quota;
  cores: Quota;
  ram: Quota;
  volumes: Quota;
  snapshots: Quota;
  gigabytes: Quota;
  floatingip: Quota;
  network: Quota;
  port: Quota;
  router: Quota;
  subnet: Quota;
  security_group: Quota;
  security_group_rule: Quota;
  port_forwardings: Quota;
}

interface QuotaResponse {
  quotas: Quotas;
}

const prettyKey = (key: keyof Quotas) => {
  const map: Record<keyof Quotas, string> = {
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

const welcomeMessages = [
  "환영합니다! 새로운 시작을 함께해요 🚀",
  "어서 오세요! 기다리고 있었어요 👋",
  "환영해요! 즐거운 시간 보내세요 🎉",
  "함께해서 기뻐요! 좋은 하루 되세요 🌟",
  "환영합니다! 오늘도 화이팅입니다 💪",
  "오신 걸 진심으로 환영합니다 🙌",
  "어서 오세요! 즐겁게 놀다 가세요 😄",
  "환영합니다! 새로운 인연을 기대해요 💫",
  "환영해요! 여기서 좋은 추억 만드세요 📖",
  "어서 오세요! 따뜻하게 맞이합니다 🔥",
  "환영합니다! 특별한 하루 되세요 🌈",
  "반가워요! 즐거운 시간을 보내세요 🥳",
  "어서 오세요! 새로운 모험이 기다리고 있어요 ⚔️",
  "환영합니다! 함께 성장해요 🌱",
  "환영해요! 이곳에서 행복하시길 바랍니다 💖",
  "어서 오세요! 차 한 잔 하고 가세요 ☕",
  "환영합니다! 멋진 여정을 시작해요 🌍",
  "반가워요! 즐거운 경험이 되길 바래요 🎶",
  "어서 오세요! 오늘도 특별한 하루 되세요 ✨",
  "환영해요! 마음껏 즐겨주세요 🕹️",
  "환영합니다! 당신의 참여가 큰 힘이 됩니다 🌟",
  "어서 오세요! 편하게 쉬다 가세요 🛋️",
  "환영해요! 새로운 기회가 열리고 있어요 🔑",
  "환영합니다! 언제나 환영해요 💌",
  "어서 오세요! 지금 이 순간을 즐겨요 🎈",
  "환영합니다! 이곳은 언제나 열려있어요 🚪",
  "반가워요! 당신의 빛으로 환해져요 💡",
  "어서 오세요! 따뜻한 공간에 오신 걸 환영해요 🌸",
  "환영합니다! 함께라서 더 즐겁습니다 🤝",
  "환영해요! 당신이 있어 더 특별해요 🌹",
];

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


export default function Navbar() {

  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [limits, setLimits] = useState<QuotaResponse | null>(null);
  const entries = Object.entries(limits?.quotas ?? {}).filter(([key]) => !["subnet", "security_group", "floatingip", "port", "router", "security_group_rule"].includes(key)) as [keyof Quotas, Quota][];
  const isLoading = !limits?.quotas;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);

    async function fetchData() {
      try {
        const res = await fetch("/api/v1/limits");
        const data: QuotaResponse = await res.json();
        setLimits(data);
      } catch (error) {
        console.error("Failed to fetch limits:", error);
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
        <div className="flex gap-x-5">
          <Button variant="outline" className="flex items-center gap-2">
            <HiComputerDesktop />
            VM 생성
          </Button>
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
            title="VM 가동 수"
            value={limits?.quotas?.instances.in_use}
            unit="개"
            isLoading={isLoading} children={undefined} />
          <StatCard
            icon={<PiNetwork className="text-4xl text-green-500" />}
            title="포트포워딩 개수"
            value={limits?.quotas?.port_forwardings.in_use}
            unit="개"
            isLoading={isLoading} children={undefined}
          />
          {/*@ts-ignore*/}
          <StatCard
            icon={<GrStorage className="text-4xl text-purple-500" />}
            title="Disk 사용량"
            isLoading={isLoading}
          >
            <div className="flex text-right">
              <p className="text-xl font-semibold text-gray-700">{limits?.quotas?.volumes.in_use} 개</p>
              <p className="text-lg text-gray-500">({limits?.quotas?.gigabytes.in_use} GB)</p>
            </div>
          </StatCard>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">계정 한도 및 서비스 상태</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 계정 한도 (도넛 차트) */}
          <div className="lg:col-span-2">
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

          {/* 서비스 상태 (임베드) */}
          <div className="w-full">
            <Card className="overflow-hidden shadow-lg h-96">
              <embed
                src="https://discordstatus.com/"
                title="Discord Status"
                className="w-full h-full border-0"
              />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
