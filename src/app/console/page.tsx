// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { components } from "@/lib/skyline-api";
import Link from "next/link";

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

export default function ConsolePage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [limits, setLimits] = useState<components["schemas"]["QuotaSet"] | null>(null);
  const [projectlogs, setProjectlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const entries = Object.entries(limits ?? {}).filter(
    ([key]) => !["subnet", "security_group", "floatingip", "port", "router", "security_group_rule", "snapshots", "network"].includes(key)
  ) as [keyof components["schemas"]["QuotaSet"], Quota][];

  // 전체 평균 사용률
  const overallPct = entries.length
    ? entries.reduce((acc, [, q]) => {
      const pct = q.limit > 0 ? Math.min(100, (q.in_use / q.limit) * 100) : 0;
      return acc + pct;
    }, 0) / entries.length
    : 0;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);

    async function fetchData() {
      setIsLoading(true);
      try {
        try {
          const resss = await fetch("/api/v1/projectlogs");
          const dataaa = await resss.json();
          setProjectlogs(Array.isArray(dataaa?.project_logs) ? dataaa.project_logs : []);
        } catch (error) {
          console.error("Error fetching project logs:", error);
          setProjectlogs([]);
        }

        try {
          const res = await fetch("/api/v1/limits");
          if (res.ok) {
            const data = await res.json();
            if (data?.quotas) {
              setLimits(data.quotas);
            }
          }
        } catch (error) {
          console.error("Error fetching limits:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-[#10131a] text-[#e1e2eb]">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header & Contextual Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#424655]/20 pb-8">
          <div>
            <span className="text-[10px] font-bold text-[#b0c6ff] tracking-[0.3em] uppercase opacity-80">Architecture Overview</span>
            <h2 className="text-4xl font-bold text-[#e1e2eb] tracking-tight mt-2">Infrastructure Hub</h2>
            <p className="text-sm text-[#c2c6d7] mt-2 font-medium opacity-70">
              <span className="text-[#b0c6ff]">{session?.user?.name}</span>님, {message}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/console/network/view">
              <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#c2c6d7] bg-[#1d2026] hover:bg-[#272a31] transition-all rounded-lg border border-[#424655]/30 shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[20px]">lan</span>
                네트워크 관리
              </button>
            </Link>
            <Link href="/console/instance/create">
              <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#001945] bg-gradient-to-r from-[#b0c6ff] to-[#558dff] rounded-lg shadow-[0_4px_20px_rgba(85,141,255,0.3)] hover:shadow-[0_4px_25px_rgba(85,141,255,0.4)] active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                인스턴스 생성
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Infrastructure Overview Cards (Asymmetric Column) */}
          <div className="md:col-span-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Instances Card */}
              <div className="bg-[#191c22] p-7 rounded-2xl border border-[#424655]/10 relative overflow-hidden group hover:border-[#b0c6ff]/30 transition-colors">
                <div className="flex justify-between items-start mb-5">
                  <span className="material-symbols-outlined text-[#b0c6ff] text-4xl">memory</span>
                  <span className="text-[10px] font-bold text-[#c2c6d7]/40 uppercase tracking-widest">{isLoading ? "Loading..." : "Live"}</span>
                </div>
                <h3 className="text-xs font-bold text-[#c2c6d7]/60 uppercase tracking-widest mb-2">Instances</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-bold tracking-tighter">{limits?.instances?.in_use ?? 0}</span>
                  <span className="text-sm font-medium text-[#b0c6ff]/60">/ {limits?.instances?.limit ?? 0}</span>
                </div>
                <div className="w-full h-2 bg-[#32353c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#b0c6ff] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(176,198,255,0.5)]"
                    style={{ width: `${limits?.instances?.limit ? Math.min(100, (limits.instances.in_use / limits.instances.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#c2c6d7]/50 mt-4 font-bold uppercase">
                  {limits?.instances?.limit ? Math.round((limits.instances.in_use / limits.instances.limit) * 100) : 0}% capacity utilized
                </p>
              </div>

              {/* Networking Card (Floating IPs) */}
              <div className="bg-[#191c22] p-7 rounded-2xl border border-[#424655]/10 relative group hover:border-[#ffb692]/30 transition-colors">
                <div className="flex justify-between items-start mb-5">
                  <span className="material-symbols-outlined text-[#ffb692] text-4xl">lan</span>
                  <span className="text-[10px] font-bold text-[#c2c6d7]/40 uppercase tracking-widest">Active</span>
                </div>
                <h3 className="text-xs font-bold text-[#c2c6d7]/60 uppercase tracking-widest mb-2">PortForwarding</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-bold tracking-tighter">{limits?.port_forwardings?.in_use ?? 0}</span>
                  <span className="text-sm font-medium text-[#ffb692]/60">/ {limits?.port_forwardings?.limit ?? 0}</span>
                </div>
                <div className="w-full h-2 bg-[#32353c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffb692] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,182,146,0.5)]"
                    style={{ width: `${limits?.port_forwardings?.limit ? Math.min(100, (limits.port_forwardings.in_use / limits.port_forwardings.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#c2c6d7]/50 mt-4 font-bold uppercase">External networking status</p>
              </div>

              {/* Storage Card */}
              <div className="bg-[#191c22] p-7 rounded-2xl border border-[#424655]/10 relative group hover:border-[#9cb4f2]/30 transition-colors">
                <div className="flex justify-between items-start mb-5">
                  <span className="material-symbols-outlined text-[#9cb4f2] text-4xl">database</span>
                  <span className="text-[10px] font-bold text-[#c2c6d7]/40 uppercase tracking-widest">Optimized</span>
                </div>
                <h3 className="text-xs font-bold text-[#c2c6d7]/60 uppercase tracking-widest mb-2">Storage Usage</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-bold tracking-tighter">{limits?.gigabytes?.in_use ?? 0}</span>
                  <span className="text-sm font-medium text-[#9cb4f2]/60">GB / {limits?.gigabytes?.limit ?? 0}</span>
                </div>
                <div className="w-full h-2 bg-[#32353c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9cb4f2] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(156,180,242,0.5)]"
                    style={{ width: `${limits?.gigabytes?.limit ? Math.min(100, (limits.gigabytes.in_use / limits.gigabytes.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#c2c6d7]/50 mt-4 font-bold uppercase">
                  {limits?.gigabytes?.limit ? Math.round((limits.gigabytes.in_use / limits.gigabytes.limit) * 100) : 0}% of provisioned tier
                </p>
              </div>
            </div>

            {/* Central Activity Feed */}
            <div className="bg-[#1d2026] p-8 rounded-2xl border border-[#424655]/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#b0c6ff] text-2xl">history</span>
                  활동 로그
                </h3>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {projectlogs.length > 0 ? (
                  projectlogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-5 p-4 rounded-xl hover:bg-[#272a31]/50 border border-transparent hover:border-[#424655]/20 transition-all">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.message.includes("fail") || log.message.includes("error")
                          ? "bg-[#93000a]/20"
                          : "bg-[#b0c6ff]/10"
                        }`}>
                        <span className={`material-symbols-outlined text-[20px] ${log.message.includes("fail") || log.message.includes("error") ? "text-[#ffb4ab]" : "text-[#b0c6ff]"
                          }`}>
                          {log.message.includes("fail") || log.message.includes("error") ? "error" : "check_circle"}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-semibold tracking-tight">{log.message}</p>
                        <p className="text-[10px] text-[#c2c6d7]/50 font-bold uppercase mt-1">{log.created_at} • system</p>
                      </div>
                      <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-full ${log.message.includes("fail") || log.message.includes("error")
                          ? "bg-[#93000a] text-[#ffdad6]"
                          : "bg-[#2b457c] text-[#b0c6ff]"
                        }`}>
                        {log.message.includes("fail") || log.message.includes("error") ? "ERROR" : "SUCCESS"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <span className="material-symbols-outlined text-5xl mb-3">cloud_off</span>
                    <p className="text-sm font-medium italic tracking-wide">활동 기록이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resource Quota Column */}
          <div className="md:col-span-4 space-y-8">
            <div className="bg-[#272a31]/40 p-8 rounded-2xl border border-[#424655]/20 flex flex-col h-full backdrop-blur-sm">
              <h3 className="text-xs font-bold text-[#c2c6d7]/60 uppercase tracking-[0.2em] mb-10">할당량 대시보드</h3>
              <div className="flex-grow flex flex-col items-center justify-center relative">
                {/* CSS Conic-Gradient Doughnut Chart */}
                <div
                  className="w-56 h-56 rounded-full flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.3)]"
                  style={{
                    background: `conic-gradient(#b0c6ff ${overallPct}%, #1d2026 0)`
                  }}
                >
                  {/* Inner Hole */}
                  <div className="absolute inset-4 rounded-full bg-[#272a31] flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <p className="text-4xl font-black tracking-tighter text-[#e1e2eb]">{Math.round(overallPct)}%</p>
                      <p className="text-[9px] uppercase font-bold text-[#c2c6d7]/40 tracking-widest mt-1">전체 사용량</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 w-full space-y-5">
                  {entries.slice(0, 5).map(([key, quota]) => {
                    const pct = quota.limit > 0 ? Math.min(100, (quota.in_use / quota.limit) * 100) : 0;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${pct > 85 ? 'bg-[#ffb692]' : 'bg-[#b0c6ff]'} shadow-[0_0_8px_currentColor]`}></div>
                            <span className="text-[#c2c6d7] uppercase tracking-wider">{prettyKey(key)}</span>
                          </div>
                          <span className="text-[#e1e2eb] tabular-nums">{quota.in_use} / {quota.limit}</span>
                        </div>
                        <div className="w-full h-1 bg-[#1d2026] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${pct > 85 ? 'bg-[#ffb692]' : 'bg-[#b0c6ff]'}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #32353c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #424655;
        }
      `}</style>
    </main>
  );
}
