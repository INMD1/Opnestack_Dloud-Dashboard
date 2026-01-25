"use client";

import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { IconServer, IconNetwork, IconDatabase, IconCode } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { Computer } from "lucide-react";

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* 상단 고정바 */}
      <nav className="px-4 pt-5 md:px-10">
        <div className="flex items-center justify-between md:justify-around">
          <p className="text-2xl font-bold">Dcloud</p>

          {/* 데스크탑 */}
          <div className="hidden md:flex items-center gap-10">
            <p>소개</p>
            <p>서비스</p>
            <p>공지사항</p>
            <Button className="text-primary-foreground"><Computer /> 시작</Button>
          </div>

          {/* 모바일 버튼 */}
          <div className="flex md:hidden items-cente gap-3">
            <button
              className=" text-2xl"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
            <Button variant="ghost" className="text-primary-foreground"><Computer className="stroke-white" /></Button>
          </div>
        </div>

        {/* 모바일 메뉴 + 애니메이션 */}
        <div
          className={`
          md:hidden overflow-hidden transition-all duration-300 ease-out
          ${open ? "max-h-60 opacity-100 mt-4" : "max-h-0 opacity-0"}
        `}
        >
          <div className="flex flex-col gap-4 py-2">
            <p>소개</p>
            <p>서비스</p>
            <p>공지사항</p>
          </div>
        </div>
      </nav>
      {/* 본문 내용 */}
      
      {/* 하단 고정바 */}
      <footer className="primary-soft rounded-base shadow-xs  ">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-body sm:text-center">© 2026 Dcloud. All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-body sm:mt-0">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">소개</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">개인정보 처리방침</a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">이용약관</a>
            </li>
            <li>
              <a href="#" className="hover:underline">문의사항</a>
            </li>
          </ul>
        </div>
      </footer>

    </div>
  );
}
