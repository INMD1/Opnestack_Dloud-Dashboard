// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useEffect, useState, useRef } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const welcomeMessages = [
  "환영합니다! 새로운 시작을 함께해요 🚀",
  "어서 오세요! 기다리고 있었어요 👋",
  "환영해요! 즐거운 시간 보내세요 🎉",
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

// 더 생동감 있는 차트 색상 (oklch 기반)
const COLORS = [
  "#ff2c2c",
  "",
  "#009DD1"
];

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
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="text-3xl font-bold gradient-text leading-tight">{pct.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground mt-1">사용 중: {limit}개 중</div>
        </div>
      </div>
    </div>
  );
}


export default function ConsolePage() {

  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [limits, setLimits] = useState<components["schemas"]["QuotaSet"] | null>(null);
  const [portlimit, setPortlimit] = useState("");
  const [projectlogs, setProjectlogs] = useState([]);
  const isLoadingRef = useRef(false);

  const entries = Object.entries(limits ?? {}).filter(([key]) => !["subnet", "security_group", "floatingip", "port", "router", "security_group_rule"].includes(key)) as [keyof components["schemas"]["QuotaSet"], Quota][];


  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);

    async function fetchData() {

      try {
        const resss = await fetch("/api/v1/projectlogs");
        const dataaa = await resss.json();
        setProjectlogs(dataaa.project_logs);
        console.log(dataaa.project_logs);
        const ress = await fetch("/api/v1/port_forwardings/stats");
        const dataa = await ress.json();
        setPortlimit(dataa);

        const res = await fetch("/api/v1/limits");
        const data = await res.json();

        data.quotas.port_forwardings.in_use = dataa.total_count;
        setLimits(data.quotas);


        isLoadingRef.current = true;
      } catch (error) {
        console.error("Error fetching limits:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="mx-auto px-14 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">안녕하세요, {session?.user?.name || "사용자"}님!</span> 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2">{message}</p>
        </div>
        <div className="flex items-center gap-x-3">
          <a href="/console/instance/create">
            <Button className="gradient-primary text-white flex items-center gap-2 hover-lift">
              <HiComputerDesktop />
              VM 생성
            </Button>
          </a>
          <a href="/console/disk/view">
            <Button variant="outline" className="flex items-center gap-2 hover-lift">
              <GrStorage />
              디스크 생성
            </Button>
          </a>
          <a href="/console/network/view">
            <Button variant="outline" className="flex items-center gap-2 hover-lift">
              <PiNetwork />
              네트워크 관리
            </Button>
          </a>
          <Button variant="outline" className="flex items-center gap-2 hover-lift">
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
            isLoading={isLoading}          >
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
            {portlimit ? (
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {portlimit.total_count} / {portlimit.limit}
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
                <p className="text-xl font-semibold text-gray-700">{limits.volumes.in_use}개 ({limits.gigabytes.in_use} GB)</p>
              </div>
            ) : (
              <p className="text-xl text-gray-500 mt-1">데이터 없음</p>
            )}
          </StatCard>

        </div>
      </section>
      <section>
        {/* 최근 활동 - 타임라인 스타일 */}
        <div className="w-full">
          <Card className="h-full hover-lift">
            <CardHeader>
              <CardTitle className="gradient-text-cyan">최근 활동</CardTitle>
              <CardDescription>계정의 최근 활동 내역입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative overflow-auto h-[20vh]">
                {/* 타임라인 세로선 */}
                <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-accent to-transparent" />
                {projectlogs.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 relative transition-all duration-300 hover:translate-x-2">
                    <div className="gradient-primary rounded-full p-2 z-10 ring-4 ring-background">
                      <FaRegClock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.created_at}</p>
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
          {isLoadingRef.current ? (
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
