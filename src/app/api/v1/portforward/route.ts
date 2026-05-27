/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const params: any = {};
        if (searchParams.get("status_filter")) params.status_filter = searchParams.get("status_filter");
        if (searchParams.get("floating_ip")) params.floating_ip = searchParams.get("floating_ip");
        if (searchParams.get("service_type")) params.service_type = searchParams.get("service_type");
        if (searchParams.get("vm_id")) params.vm_id = searchParams.get("vm_id");

        const skylineClient = getSkylineClient(session.keystone_token);

        // 현재 사용자의 VM 목록을 조회하여 내부망 IP 및 VM ID 집합 생성
        const { data: serversData, error: serversError } = await (skylineClient as any).GET("/api/v1/extension/servers", {});

        const userVmIds = new Set<string>();
        const userVmIps = new Set<string>();

        if (!serversError && serversData?.servers) {
            for (const server of serversData.servers as any[]) {
                if (server.id) userVmIds.add(String(server.id));
                // fixed_addresses 배열에서 내부망 IP 수집
                if (Array.isArray(server.fixed_addresses)) {
                    for (const ip of server.fixed_addresses) {
                        if (ip) userVmIps.add(String(ip));
                    }
                }
            }
        } else if (serversError) {
            logger.devError("Failed to fetch user VM list for portforward filtering:", serversError);
        }

        const { data, error } = await (skylineClient as any).GET("/api/v1/portforward", {
            params: { query: params }
        });

        if (error) {
            logger.devError("Backend portforward error:", error);
            // Return empty array to prevent frontend crashes
            return new NextResponse(JSON.stringify([]), { status: 200 });
        }

        // 현재 사용자의 VM에 속한 포트포워딩 규칙만 필터링
        // (VM ID 또는 내부망 IP 기준으로 이중 검증)
        let filteredData = data;
        if (Array.isArray(data) && (userVmIds.size > 0 || userVmIps.size > 0)) {
            filteredData = data.filter((pf: any) => {
                const matchById = pf.user_vm_id && userVmIds.has(String(pf.user_vm_id));
                const matchByIp = pf.user_vm_internal_ip && userVmIps.has(String(pf.user_vm_internal_ip));
                return matchById || matchByIp;
            });
        }

        return new NextResponse(JSON.stringify(filteredData), { status: 200 });

    } catch (err) {
        logger.devError("Port Forward List API error:", err);
        // Return empty array to prevent frontend crashes
        return new NextResponse(JSON.stringify([]), { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();

        // user_vm_id 필수 검증
        if (!body.user_vm_id) {
            return new NextResponse(JSON.stringify({ message: "user_vm_id는 필수입니다." }), { status: 400 });
        }

        // 내부 포트 기본 유효성 검증 (포트 범위: 1~65535)
        if (body.user_vm_internal_port !== null && body.user_vm_internal_port !== undefined) {
            const port = parseInt(body.user_vm_internal_port);
            if (isNaN(port) || port < 1 || port > 65535) {
                return new NextResponse(JSON.stringify({ message: "내부 포트는 1에서 65535 사이여야 합니다." }), { status: 400 });
            }
        }

        // 외부 포트는 백엔드에서 설정된 허용 범위로 검증
        // (하드코딩된 범위 제한 없음 - 관리자가 설정한 port_range 사용)

        const skylineClient = getSkylineClient(session.keystone_token);

        // 소유권 검증: user_vm_id가 현재 세션 사용자 소유인지 확인
        const { error: instanceError } = await (skylineClient as any).GET(`/api/v1/instances/${body.user_vm_id}`, {});
        if (instanceError) {
            logger.devError("POST portforward ownership check failed for vm_id:", body.user_vm_id, instanceError);
            return new NextResponse(
                JSON.stringify({ message: "Forbidden: 해당 VM에 대한 접근 권한이 없습니다." }),
                { status: 403 }
            );
        }
        const { data, error } = await (skylineClient as any).POST("/api/v1/portforward", {
            body: body
        });

        if (error) {
            logger.devError("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: (error as any).status || 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 201 });

    } catch (err) {
        logger.devError("Port Forward Create API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward Create API failed" }), { status: 500 });
    }
}
