"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Computer, Menu, X, Cpu, Zap, Globe, CheckCircle2, ArrowRight, Terminal, Server, BarChart3, HardDrive, ShieldCheck, Network, Bell } from "lucide-react";
import AnnouncementList from "@/components/announcements/AnnouncementList";

// 데이터 정의 (제공해주신 표 내용 반영)
const FLAVORS = [
  { id: "small", category: "Entry", name: "small", cpu: 1, ram: "512 MB", disk: "10 GB", desc: "개인 학습 및 간단한 테스트용" },
  { id: "m1", category: "General", name: "medium-1", cpu: 1, ram: "1 GB", disk: "25 GB", desc: "웹 서버 및 경량 애플리케이션" },
  { id: "m2", category: "General", name: "medium-2", cpu: 1, ram: "1 GB", disk: "40 GB", desc: "저장 공간이 더 필요한 웹 서비스" },
  { id: "m3", category: "General", name: "medium-3", cpu: 1, ram: "1 GB", disk: "55 GB", desc: "General 라인업 최대 스토리지" },
  { id: "l1", category: "Standard", name: "Large-1", cpu: 2, ram: "2 GB", disk: "55 GB", desc: "데이터베이스 및 백엔드 서버 권장", popular: true },
  { id: "l2", category: "Standard", name: "Large-2", cpu: 2, ram: "2 GB", disk: "65 GB", desc: "넉넉한 공간의 표준 워크로드" },
  { id: "l3", category: "Standard", name: "Large-3", cpu: 2, ram: "3.1 GB", disk: "55 GB", desc: "메모리 최적화 (Redis, Cache)" },
  { id: "b1", category: "Pro", name: "Big-1", cpu: 3, ram: "2 GB", disk: "55 GB", desc: "고성능 연산 처리 (Batch Job)" },
  { id: "b2", category: "Pro", name: "Big-2", cpu: 3, ram: "4 GB", disk: "65 GB", desc: "최고 성능의 플래그십 인스턴스" },
];


export default function Home() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  // 탭 필터링 로직
  const filteredFlavors = activeTab === "All"
    ? FLAVORS
    : FLAVORS.filter((f) => f.category === activeTab);

  return (
    <div className="w-screen min-h-screen bg-[#050505] text-white overflow-x-hidden relative font-sans selection:bg-cyan-500/30">

      {/* 1. 배경 그리드 및 글로우 효과 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-900/20 via-cyan-900/10 to-transparent blur-3xl" />
      </div>

      {/* 2. 네비게이션 바 */}
      <nav className="relative z-50 px-6 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter cursor-pointer">

            <span>Dcloud</span>
          </div>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#intro" className="hover:text-cyan-400 transition-colors">소개</a>
            <a href="#service" className="hover:text-cyan-400 transition-colors">서비스</a>
            <a href="#notice" className="hover:text-cyan-400 transition-colors">공지사항</a>
            <a href="/console">
              <Button className="bg-white text-black hover:bg-slate-200 font-semibold">
                <Computer className="w-4 h-4 mr-2" /> Console 시작
              </Button>
            </a>
          </div>

          {/* 모바일 토글 버튼 */}
          <div className="md:hidden">
            <button onClick={() => setOpen(!open)} className="text-white focus:outline-none">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-white/5 bg-[#050505]/95 backdrop-blur-md absolute top-full left-0 w-full z-50
            ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="flex flex-col gap-4 p-6 text-center text-slate-300">
            <a href="#intro" onClick={() => setOpen(false)} className="hover:text-white">소개</a>
            <a href="#service" onClick={() => setOpen(false)} className="hover:text-white">서비스</a>
            <a href="#notice" onClick={() => setOpen(false)} className="hover:text-white">공지사항</a>
            <a href="/console" onClick={() => setOpen(false)} className="text-cyan-400 font-bold">Console 시작</a>
          </div>
        </div>
      </nav>

      {/* 3. 메인 컨텐츠 영역 */}
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

        {/* Left: 텍스트 및 CTA */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-cyan-400 text-xs font-mono mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            New Region Available
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Deploy your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Cloud Infrastructure
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            동의대학교 응용소프트웨어공학 <span className="text-white font-semibold">Dcloud Infra</span>를 통해<br className="hidden md:block" />
            <span className="text-cyan-200/80">OpenStack</span> 기반의 고성능 클라우드 환경을 경험하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="/console">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Start Building <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </div>

          {/* 하단 스탯 */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm font-mono text-slate-500 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>동의대 학생 무료 지원</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>학습/연구/개발 전용 인프라</span>
            </div>
          </div>
        </div>

        {/* Right: 터미널 윈도우 */}
        <div className="flex-1 w-full max-w-lg relative group perspective-1000">
          {/* 뒤쪽 글로우 효과 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative rounded-xl bg-[#0F1117] border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm leading-6 transform transition-transform duration-500 hover:scale-[1.01]">

            {/* 터미널 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1A1D24] border-b border-slate-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-slate-500 text-xs flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                user@dcloud-cli
              </div>
              <div className="w-4"></div>
            </div>

            {/* 터미널 내용 */}
            <div className="p-6 text-slate-300 space-y-4">
              {/* Command 1 */}
              <div>
                <div className="flex gap-2">
                  <span className="text-green-400">➜</span>
                  <span className="text-cyan-400">~</span>
                  <span>dcloud instance create --name web-server</span>
                </div>
                <div className="mt-1 text-slate-500">
                  Initializing request to OpenStack Nova...
                </div>
              </div>

              {/* Process Log */}
              <div className="space-y-1 pl-2 border-l-2 border-slate-800 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>[+] Validating Image (Ubuntu 22.04)</span>
                  <span className="text-green-500">Done</span>
                </div>
                <div className="flex justify-between">
                  <span>[+] Allocating vCPU & RAM</span>
                  <span className="text-green-500">Done</span>
                </div>
                <div className="flex justify-between">
                  <span>[+] Attaching Floating IP</span>
                  <span className="text-green-500">192.168.0.5</span>
                </div>
                <div className="flex justify-between">
                  <span>[+] Setting up SSH Keys</span>
                  <span className="text-green-500">Done</span>
                </div>
              </div>

              {/* Success */}
              <div className="text-green-400 font-semibold">
                ✔ Instance &apos;web-server&apos; is running!
              </div>

              {/* Blinking Cursor */}
              <div className="flex gap-2 items-center">
                <span className="text-green-400">➜</span>
                <span className="text-cyan-400">~</span>
                <span>ssh ubuntu@192.168.0.5</span>
                <span className="w-2 h-4 bg-slate-500 animate-pulse"></span>
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute -right-6 top-10 bg-[#1A1D24] border border-slate-700 p-3 rounded-lg shadow-xl animate-bounce hidden md:block">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="absolute -left-6 bottom-16 bg-[#1A1D24] border border-slate-700 p-3 rounded-lg shadow-xl animate-bounce delay-700 hidden md:block">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* 4. 하단 파트너 로고 (Tech Stack) */}
      <div className="border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 py-10">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Supported Operating Systems
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* 로고 텍스트 스타일 통일 */}
            {['Ubuntu', 'Rocky Linux', 'Debian', 'CentOS', 'Alpine Linux'].map((os) => (
              <span key={os} className="text-lg md:text-xl font-bold text-slate-300 hover:text-white cursor-default">
                {os}
              </span>
            ))}
          </div>
        </div>
      </div>
      <section id="intro" className="relative py-24 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto px-6">

          {/* 섹션 헤더 */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="text-cyan-400">Dcloud</span>?
            </h2>
            <p className="text-slate-400 text-lg">
              동의대학교 학생들을 위해 설계된 고성능 클라우드 플랫폼입니다.<br />
              상용 클라우드와 동일한 OpenStack 환경에서 실무 기술을 익히세요.
            </p>
          </div>

          {/* 특징 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-[#0F1117] border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Open Standard</h3>
              <p className="text-slate-400 leading-relaxed">
                글로벌 표준인 <strong className="text-slate-200">OpenStack</strong>을 기반으로 구축되었습니다. AWS, Azure와 유사한 IaaS 환경을 경험하며 클라우드 아키텍처를 학습하세요.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-[#0F1117] border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">High Performance</h3>
              <p className="text-slate-400 leading-relaxed">
                최신 고사양 서버와 <strong className="text-slate-200">NVMe SSD로 캐시된</strong> 스토리지를 제공합니다. 복잡한 컴파일 작업과 데이터 처리도 지연 없이 수행할 수 있습니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-[#0F1117] border border-slate-800 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Free for Students</h3>
              <p className="text-slate-400 leading-relaxed">
                동의대학교 응용소프트웨어공학 전공생이라면 누구나 <strong className="text-slate-200">무료</strong>로 개인 서버를 할당받아 프로젝트에 활용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">

        {/* 배경 그리드 (통일감 유지) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="container mx-auto px-6 relative z-10">

          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* 1. Left: 설명 텍스트 */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-800/50 text-blue-400 text-xs font-mono mb-6">
                <Network className="w-3 h-3" />
                Secure Networking
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Centralized <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Port Forwarding System
                </span>
              </h2>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Dcloud는 보안과 효율성을 위해 <strong>중앙 게이트웨이 시스템</strong>을 운영합니다.
                <br className="hidden md:block" />
                모든 외부 접근은 중앙 방화벽을 거쳐, 설정된 포트를 통해 사용자의 내부 인스턴스로 안전하게 연결(Forwarding)됩니다.
              </p>

              {/* 특징 리스트 */}
              <div className="space-y-4 text-left inline-block">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">중앙 집중형 보안 (Central Security)</h4>
                    <p className="text-slate-500 text-sm mt-1">단일 진입점에서 악성 트래픽을 사전에 차단합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Public IP 절약 및 관리</h4>
                    <p className="text-slate-500 text-sm mt-1">효율적인 IP 관리로 학생들에게 무료 인프라를 제공합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Right: 포트포워딩 애니메이션 다이어그램 */}
            <div className="flex-1 w-full max-w-xl">
              <div className="relative bg-[#0F1117] border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden">

                {/* 배경 회로도 느낌 */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>

                {/* === DIAGRAM UI === */}
                <div className="relative flex flex-col ">

                  {/* [Layer 1] 외부 인터넷 (The Internet) */}
                  <div className="flex items-center justify-center">
                    <div className="relative z-10 bg-slate-800/50 border border-slate-600 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      <span>External Traffic (User)</span>
                    </div>
                  </div>

                  {/* 연결 선 (Vertical Line 1) + 애니메이션 점 */}
                  <div className="h-12 w-full flex justify-center relative">
                    <div className="h-full w-px bg-slate-700"></div>
                    {/* 내려오는 패킷 애니메이션 */}
                    <div className="absolute top-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-network-down"></div>
                  </div>

                  {/* [Layer 2] 중앙 게이트웨이 (Central Gateway) */}
                  <div className="relative z-10 bg-[#1A1D24] border border-blue-500/30 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <div className="absolute -top-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      PORT FORWARDING
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-400 mb-2" />
                    <div className="text-white font-bold text-sm">Central Gateway</div>
                    <div className="text-slate-500 text-xs font-mono mt-1">Public IP: 203.247.xxx.xxx</div>

                    {/* 포트 매핑 테이블 시각화 */}
                    <div className="mt-3 w-full bg-black/40 rounded border border-white/5 p-2 text-[10px] font-mono text-slate-400 space-y-1">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Ext Port</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span>Int IP:Port</span>
                      </div>
                      <div className="flex justify-between text-cyan-200">
                        <span>:1001</span>
                        <ArrowRight className="w-3 h-3 text-cyan-500" />
                        <span>192.168.0.2:80</span>
                      </div>
                      <div className="flex justify-between text-purple-200">
                        <span>:1002</span>
                        <ArrowRight className="w-3 h-3 text-purple-500" />
                        <span>192.168.0.3:22</span>
                      </div>
                    </div>
                  </div>

                  {/* 연결 선 (Split Lines) */}
                  <div className="h-12 w-full relative">
                    {/* 중앙 선 */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-6 w-px bg-slate-700"></div>
                    {/* 분기 선 (가로) */}
                    <div className="absolute top-6 left-1/4 right-1/4 h-px bg-slate-700"></div>
                    {/* 분기 선 (내려가는 선들) */}
                    <div className="absolute top-6 left-1/4 h-6 w-px bg-slate-700"></div>
                    <div className="absolute top-6 right-1/4 h-6 w-px bg-slate-700"></div>

                    {/* 퍼져나가는 패킷 애니메이션 (좌측) */}
                    <div className="absolute top-6 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-network-split-left opacity-0"></div>
                    {/* 퍼져나가는 패킷 애니메이션 (우측) */}
                    <div className="absolute top-6 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-network-split-right opacity-0"></div>
                  </div>

                  {/* [Layer 3] 내부 인스턴스들 (Internal Instances) */}
                  <div className="flex justify-between gap-4">
                    {/* VM 1 */}
                    <div className="flex-1 bg-[#15171e] border border-slate-800 rounded-lg p-3 flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 absolute top-2 right-2 animate-pulse"></div>
                      <Server className="w-6 h-6 text-slate-400 mb-2" />
                      <div className="text-slate-300 font-bold text-xs">Web Server</div>
                      <div className="text-slate-600 text-[10px] font-mono mt-1">192.168.0.2</div>
                      <div className="mt-2 px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-[10px] rounded border border-cyan-800">
                        Port 80
                      </div>
                    </div>

                    {/* VM 2 */}
                    <div className="flex-1 bg-[#15171e] border border-slate-800 rounded-lg p-3 flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 absolute top-2 right-2 animate-pulse"></div>
                      <Server className="w-6 h-6 text-slate-400 mb-2" />
                      <div className="text-slate-300 font-bold text-xs">DB Server</div>
                      <div className="text-slate-600 text-[10px] font-mono mt-1">192.168.0.3</div>
                      <div className="mt-2 px-2 py-0.5 bg-purple-900/30 text-purple-400 text-[10px] rounded border border-purple-800">
                        Port 22
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* 애니메이션 스타일 정의 (Tailwind 설정에 없어도 작동하도록 style 태그 주입) */}
          <style jsx>{`
          @keyframes network-down {
            0% { top: 0; opacity: 0; }
            20% { opacity: 1; }
            90% { top: 100%; opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          @keyframes network-split-left {
            0% { left: 50%; top: 24px; opacity: 0; }
            10% { opacity: 1; }
            50% { left: 25%; top: 24px; }
            100% { left: 25%; top: 48px; opacity: 0; }
          }
          @keyframes network-split-right {
            0% { left: 50%; top: 24px; opacity: 0; }
            10% { opacity: 1; }
            50% { left: 75%; top: 24px; }
            100% { left: 75%; top: 48px; opacity: 0; }
          }
          .animate-network-down {
            animation: network-down 2s infinite ease-in-out;
          }
          .animate-network-split-left {
            animation: network-split-left 2s infinite ease-in-out;
            animation-delay: 1s; /* 중앙 도달 후 실행 */
          }
          .animate-network-split-right {
            animation: network-split-right 2s infinite ease-in-out;
            animation-delay: 1s; /* 중앙 도달 후 실행 */
          }
        `}</style>

        </div>
      </section>
      <section id="service" className="py-24 bg-[#08090d] relative overflow-hidden">
        {/* 배경 데코레이션 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">

          {/* 헤더 */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Instance Flavors
            </h2>
            <p className="text-slate-400 text-lg">
              프로젝트 규모에 맞는 최적의 컴퓨팅 파워를 선택하세요.<br />
              모든 인스턴스는 <span className="text-cyan-400 font-mono">Dcloud Internal Network</span>와 연동됩니다.
            </p>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["All", "Entry", "General", "Standard", "Pro"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === tab
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-white"
                  }`}
              >
                {tab === "All" ? "전체 보기" : tab === "Pro" ? "High Performance" : tab}
              </button>
            ))}
          </div>

          {/* Flavor 리스트 (Grid Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlavors.map((flavor) => (
              <div
                key={flavor.id}
                className={`group relative bg-[#0F1117] border rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 ${flavor.popular
                  ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                  : "border-slate-800 hover:border-slate-600"
                  }`}
              >
                {/* 추천 뱃지 */}
                {flavor.popular && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-20">
                    RECOMMENDED
                  </div>
                )}

                <div className="p-6">
                  {/* 상단 이름 & 아이콘 */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${flavor.category === 'Pro' ? 'text-purple-400' :
                        flavor.category === 'Standard' ? 'text-cyan-400' : 'text-slate-500'
                        }`}>
                        {flavor.category}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {flavor.name}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-lg ${flavor.category === 'Pro' ? 'bg-purple-500/10 text-purple-400' :
                      flavor.category === 'Standard' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                      <Server className="w-5 h-5" />
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-slate-400 mb-6 h-10 line-clamp-2">
                    {flavor.desc}
                  </p>

                  {/* 스펙 그리드 */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-800 mb-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-1 text-slate-500"><Cpu className="w-4 h-4" /></div>
                      <div className="text-sm font-bold text-white">{flavor.cpu} vCPU</div>
                    </div>
                    <div className="text-center border-l border-slate-800">
                      <div className="flex justify-center mb-1 text-slate-500"><BarChart3 className="w-4 h-4" /></div>
                      <div className="text-sm font-bold text-white">{flavor.ram}</div>
                    </div>
                    <div className="text-center border-l border-slate-800">
                      <div className="flex justify-center mb-1 text-slate-500"><HardDrive className="w-4 h-4" /></div>
                      <div className="text-sm font-bold text-white">{flavor.disk}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 추가 안내 (Volume Add-on) */}
          <div className="mt-16 bg-[#11131a] border border-slate-800 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* 글로우 효과 */}
            <div className="absolute -left-10 bottom-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex-1 text-center md:text-left z-10">
              <h4 className="text-xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                스펙이 부족하신가요?
              </h4>
              <p className="text-slate-400 text-sm md:text-base">
                기본 제공 Flavor 외에도, 신청을 통해 <span className="text-white font-semibold">용량제별 리소스 추가(Volume Add-on)</span>가 가능합니다.<br className="hidden md:block" />
                vCPU, RAM, Block Storage를 필요한 만큼 유연하게 확장하세요.
              </p>
            </div>

            <div className="flex gap-3 z-10">
              <div className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
                + vCPU
              </div>
              <div className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
                + RAM
              </div>
              <div className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
                + SSD
              </div>
            </div>

            <div className="shrink-0 z-10">
              <button disabled className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-cyan-50 text-sm transition-colors shadow-lg">
                준비중
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 공지사항 섹션 */}
      <section id="notice" className="py-24 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto px-6">
          {/* 헤더 */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900/20 border border-yellow-800/50 text-yellow-400 text-xs font-mono mb-6">
              <Bell className="w-3 h-3" />
              Notice
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              공지사항
            </h2>
            <p className="text-slate-400 text-lg">
              Dcloud 서비스의 최신 소식과 업데이트를 확인하세요.
            </p>
          </div>

          {/* 공지사항 목록 */}
          <div className="max-w-3xl mx-auto">
            <AnnouncementList />
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 DCloud Infra. OpenStack 기반 클라우드 관리 플랫폼.</p>
        </div>
      </footer>
    </div>
  );
}