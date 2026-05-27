/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ vm_id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { vm_id } = await params;
        const skylineClient = getSkylineClient(session.keystone_token);

        // 보안 검증: 요청한 VM이 현재 세션 사용자 소유인지 확인
        // 사용자의 토큰으로 해당 인스턴스를 조회했을 때 성공하면 소유자임을 의미
        const { error: instanceError } = await (skylineClient as any).GET(`/api/v1/instances/${vm_id}`, {});
        if (instanceError) {
            logger.devError("Ownership verification failed for vm_id:", vm_id, instanceError);
            return new NextResponse(
                JSON.stringify({ message: "Forbidden: 해당 VM에 대한 접근 권한이 없습니다." }),
                { status: 403 }
            );
        }

        // 소유권 확인 후 포트포워딩 목록 조회
        const { data, error } = await (skylineClient as any).GET(`/api/v1/portforward/vm/${vm_id}`);

        if (error) {
            logger.devError("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: (error as any).status || 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });

    } catch (err) {
        logger.devError("Port Forward VM API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward VM API failed" }), { status: 500 });
    }
}
