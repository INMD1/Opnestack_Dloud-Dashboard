// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { components } from "@/lib/skyline-api";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <main className="min-h-screen p-4 sm:p-6 md:p-10 bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Header & Contextual Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
          <div>
            <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase opacity-80">Architecture Overview</span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2">Infrastructure Hub</h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium opacity-70">
              <span className="text-primary font-bold">{session?.user?.name}</span>님, {message}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 w-full md:w-auto">
            <Link href="/console/network/view" className="flex-1 md:flex-none">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-muted-foreground bg-secondary/50 hover:bg-secondary transition-all rounded-xl border border-border shadow-sm active:scale-95">
                <span className="material-symbols-outlined text-[20px]">lan</span>
                네트워크 관리
              </button>
            </Link>
            <Link href="/console/instance/create" className="flex-1 md:flex-none">
              <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black text-primary-foreground bg-primary rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[20px]">add</span>
                인스턴스 생성
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Infrastructure Overview Cards (Asymmetric Column) */}
          <div className="md:col-span-12 lg:col-span-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Instances Card */}
              <div className="bg-card p-6 sm:p-7 rounded-2xl border border-border relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-3xl">memory</span>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest px-2 py-1 bg-muted/50 rounded-md">{isLoading ? "Loading..." : "Live"}</span>
                </div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Instances</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-black tracking-tighter text-foreground">{limits?.instances?.in_use ?? 0}</span>
                  <span className="text-sm font-bold text-primary/60">/ {limits?.instances?.limit ?? 0}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    style={{ width: `${limits?.instances?.limit ? Math.min(100, (limits.instances.in_use / limits.instances.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-muted-foreground/50 mt-4 font-black uppercase">
                  {limits?.instances?.limit ? Math.round((limits.instances.in_use / limits.instances.limit) * 100) : 0}% capacity utilized
                </p>
              </div>

              {/* Networking Card */}
              <div className="bg-card p-6 sm:p-7 rounded-2xl border border-border relative group hover:border-chart-2/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2 bg-chart-2/10 rounded-lg">
                    <span className="material-symbols-outlined text-chart-2 text-3xl">lan</span>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest px-2 py-1 bg-muted/50 rounded-md">Active</span>
                </div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">PortForwarding</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-black tracking-tighter text-foreground">{limits?.port_forwardings?.in_use ?? 0}</span>
                  <span className="text-sm font-bold text-chart-2/60">/ {limits?.port_forwardings?.limit ?? 0}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-2 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--chart-2),0.5)]"
                    style={{ width: `${limits?.port_forwardings?.limit ? Math.min(100, (limits.port_forwardings.in_use / limits.port_forwardings.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-muted-foreground/50 mt-4 font-black uppercase">External networking status</p>
              </div>

              {/* Storage Card */}
              <div className="bg-card p-6 sm:p-7 rounded-2xl border border-border relative group hover:border-chart-1/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div className="p-2 bg-chart-1/10 rounded-lg">
                    <span className="material-symbols-outlined text-chart-1 text-3xl">database</span>
                  </div>
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest px-2 py-1 bg-muted/50 rounded-md">Optimized</span>
                </div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Storage Usage</h3>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-black tracking-tighter text-foreground">{limits?.gigabytes?.in_use ?? 0}</span>
                  <span className="text-sm font-bold text-chart-1/60">GB / {limits?.gigabytes?.limit ?? 0}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--chart-1),0.5)]"
                    style={{ width: `${limits?.gigabytes?.limit ? Math.min(100, (limits.gigabytes.in_use / limits.gigabytes.limit) * 100) : 0}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-muted-foreground/50 mt-4 font-black uppercase">
                  {limits?.gigabytes?.limit ? Math.round((limits.gigabytes.in_use / limits.gigabytes.limit) * 100) : 0}% of provisioned tier
                </p>
              </div>
            </div>

            {/* Central Activity Feed */}
            <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-md">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-foreground uppercase tracking-tight">
                  <span className="material-symbols-outlined text-primary text-2xl">history</span>
                  Activity Log
                </h3>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {projectlogs.length > 0 ? (
                  projectlogs.map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 border border-transparent hover:border-border transition-all group">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        log.message.includes("fail") || log.message.includes("error")
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      )}>
                        <span className="material-symbols-outlined text-[20px]">
                          {log.message.includes("fail") || log.message.includes("error") ? "error" : "check_circle"}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold tracking-tight text-foreground truncate">{log.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase mt-1">{log.created_at} • system</p>
                      </div>
                      <span className={cn(
                        "text-[8px] font-black tracking-widest px-2.5 py-1 rounded-lg shrink-0",
                        log.message.includes("fail") || log.message.includes("error")
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary text-primary-foreground"
                      )}>
                        {log.message.includes("fail") || log.message.includes("error") ? "ERROR" : "SUCCESS"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
                    <p className="text-xs font-black uppercase tracking-widest">No activity records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resource Quota Column */}
          <div className="md:col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border flex flex-col h-full shadow-lg relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-10 relative z-10">Resource Quota</h3>
              
              <div className="flex-grow flex flex-col items-center justify-center relative z-10">
                {/* CSS Conic-Gradient Doughnut Chart */}
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center relative shadow-2xl transition-transform duration-1000 hover:scale-105"
                  style={{
                    background: `conic-gradient(var(--primary) ${overallPct}%, var(--muted) 0)`
                  }}
                >
                  {/* Inner Hole */}
                  <div className="absolute inset-4 sm:inset-5 rounded-full bg-card flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <p className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">{Math.round(overallPct)}%</p>
                      <p className="text-[9px] uppercase font-black text-muted-foreground/40 tracking-widest mt-1">Total Usage</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 w-full space-y-5">
                  {entries.slice(0, 5).map(([key, quota]) => {
                    const pct = quota.limit > 0 ? Math.min(100, (quota.in_use / quota.limit) * 100) : 0;
                    return (
                      <div key={key} className="space-y-2 group">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-2 h-2 rounded-full transition-all duration-500",
                              pct > 85 ? 'bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'
                            )}></div>
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{prettyKey(key)}</span>
                          </div>
                          <span className="text-foreground tabular-nums font-bold">{quota.in_use} / {quota.limit}</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000 ease-in-out",
                              pct > 85 ? 'bg-destructive' : 'bg-primary'
                            )}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-border flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Security Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--muted-foreground);
        }
      `}</style>
    </main>
  );
}
