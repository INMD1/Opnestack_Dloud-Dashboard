"use client";

import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { IconServer, IconNetwork, IconDatabase, IconCode } from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="animate-float">
            <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center shadow-2xl">
              <IconServer className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl">
            <GradientText variant="primary">
              DCloud Infra
            </GradientText>
            <br />
            클라우드 관리 플랫폼
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            OpenStack 기반의 강력한 클라우드 인프라를 손쉽게 관리하세요.
            <br />
            모던한 UI로 더욱 편리한 관리 경험을 제공합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/console">
              <Button size="lg" className="gradient-primary text-white hover-lift text-lg px-8 py-6">
                대시보드로 이동 →
              </Button>
            </Link>
            <Link href="/console/instance/view">
              <Button size="lg" variant="outline" className="hover-lift text-lg px-8 py-6">
                인스턴스 관리
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <GradientText variant="cyan">주요 기능</GradientText>
          </h2>
          <p className="text-xl text-muted-foreground">
            클라우드 인프라 관리에 필요한 모든 것
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hover className="text-center p-8">
            <div className="gradient-primary p-4 rounded-full inline-block mb-4">
              <IconServer className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">인스턴스 관리</h3>
            <p className="text-muted-foreground">
              가상 머신을 쉽게 생성하고 관리하며 모니터링할 수 있습니다.
            </p>
          </GlassCard>

          <GlassCard hover className="text-center p-8">
            <div className="gradient-accent p-4 rounded-full inline-block mb-4">
              <IconNetwork className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">네트워크 설정</h3>
            <p className="text-muted-foreground">
              포트포워딩, IP 관리 등 네트워크를 간편하게 구성하세요.
            </p>
          </GlassCard>

          <GlassCard hover className="text-center p-8">
            <div className="gradient-primary p-4 rounded-full inline-block mb-4">
              <IconDatabase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">스토리지 관리</h3>
            <p className="text-muted-foreground">
              디스크 볼륨과 스냅샷을 효율적으로 관리할 수 있습니다.
            </p>
          </GlassCard>

          <GlassCard hover className="text-center p-8">
            <div className="gradient-accent p-4 rounded-full inline-block mb-4">
              <IconCode className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">SSH 키 관리</h3>
            <p className="text-muted-foreground">
              보안 접속을 위한 키페어를 쉽게 생성하고 관리하세요.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <GlassCard className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">99.9%</div>
              <p className="text-muted-foreground">가용성 보장</p>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">24/7</div>
              <p className="text-muted-foreground">모니터링 지원</p>
            </div>
            <div>
              <div className="text-5xl font-bold gradient-text mb-2">∞</div>
              <p className="text-muted-foreground">확장 가능한 리소스</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* CTA 섹션 */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <GlassCard className="p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            <GradientText variant="primary">지금 바로 시작하세요</GradientText>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            강력한 OpenStack 클라우드 인프라를 프리미엄 대시보드로 관리해보세요.
          </p>
          <Link href="/console">
            <Button size="lg" className="gradient-primary text-white hover-lift text-lg px-12 py-6">
              대시보드 시작하기 →
            </Button>
          </Link>
        </GlassCard>
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
