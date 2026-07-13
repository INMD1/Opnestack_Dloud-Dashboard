/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ rule_id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { rule_id } = await params;

        // 보안 검증을 위해 vm_id 쿼리 파라미터 필수 요구
        const { searchParams } = new URL(req.url);
        const vm_id = searchParams.get("vm_id");
        if (!vm_id) {
            return new NextResponse(
                JSON.stringify({ message: "Bad Request: vm_id 파라미터가 필요합니다." }),
                { status: 400 }
            );
        }

        const skylineClient = getSkylineClient(session.keystone_token);

        // 1차 검증: 요청한 VM이 현재 세션 사용자 소유인지 확인
        const { error: instanceError } = await (skylineClient as any).GET(`/api/v1/instances/${encodeURIComponent(vm_id)}`, {});
        if (instanceError) {
            logger.devError("Ownership verification failed for vm_id:", vm_id, instanceError);
            return new NextResponse(
                JSON.stringify({ message: "Forbidden: 해당 VM에 대한 접근 권한이 없습니다." }),
                { status: 403 }
            );
        }

        // 2차 검증: 삭제하려는 rule_id가 해당 VM에 속한 규칙인지 확인
        const { data: pfList, error: pfListError } = await (skylineClient as any).GET(`/api/v1/portforward/vm/${encodeURIComponent(vm_id)}`);
        if (pfListError || !Array.isArray(pfList)) {
            logger.devError("Failed to fetch port forwarding list for ownership check:", pfListError);
            return new NextResponse(
                JSON.stringify({ message: "포트포워딩 소유권 확인에 실패했습니다." }),
                { status: 500 }
            );
        }

        const ruleExists = pfList.some((pf: any) => String(pf.rule_id) === String(rule_id));
        if (!ruleExists) {
            logger.devError("Rule ownership mismatch — rule_id:", rule_id, "vm_id:", vm_id);
            return new NextResponse(
                JSON.stringify({ message: "Forbidden: 해당 포트포워딩 규칙에 대한 삭제 권한이 없습니다." }),
                { status: 403 }
            );
        }

        // 소유권 이중 확인 완료 후 삭제 실행
        const { error } = await (skylineClient as any).DELETE(`/api/v1/portforward/${encodeURIComponent(rule_id)}`);

        if (error) {
            logger.devError("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        logger.devError("Port Forward Delete API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward Delete API failed" }), { status: 500 });
    }
}
