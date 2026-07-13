import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";
import { components } from "@/lib/skyline-api";

type Server = components["schemas"]["ServersResponseBase"];

// /api/v1/portforward 는 Skyline 자동 생성 타입에 없는 커스텀 엔드포인트
interface PortForwardRule {
    user_vm_id?: string | null;
    user_vm_internal_ip?: string | null;
    [key: string]: unknown;
}

interface PortForwardQueryParams {
    status_filter?: string;
    floating_ip?: string;
    service_type?: string;
    vm_id?: string;
}

interface PortForwardCreateBody {
    rule_name: string;
    user_vm_id: string;
    user_vm_name: string;
    user_vm_internal_ip: string;
    user_vm_internal_port: number;
    protocol: string;
    service_type: string;
    proxy_external_port?: number | null;
}

// Skyline 타입에 정의되지 않은 커스텀 엔드포인트 호출용 어댑터
function asUntypedClient(client: ReturnType<typeof getSkylineClient>) {
    return client as unknown as {
        GET: (path: string, opts?: { params?: { query?: Record<string, string | undefined> } }) => Promise<{ data?: unknown; error?: unknown }>;
        POST: (path: string, opts?: { body?: unknown }) => Promise<{ data?: unknown; error?: unknown }>;
    };
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const params: PortForwardQueryParams = {};
        const statusFilter = searchParams.get("status_filter");
        const floatingIp = searchParams.get("floating_ip");
        const serviceType = searchParams.get("service_type");
        const vmId = searchParams.get("vm_id");

        if (statusFilter) params.status_filter = statusFilter;
        if (floatingIp) params.floating_ip = floatingIp;
        if (serviceType) params.service_type = serviceType;
        if (vmId) params.vm_id = vmId;

        const skylineClient = getSkylineClient(session.keystone_token);

        // 현재 사용자의 VM 목록을 조회하여 VM ID·내부망 IP 집합 생성
        const { data: serversData, error: serversError } = await skylineClient.GET("/api/v1/extension/servers", {});

        if (serversError || !serversData?.servers) {
            logger.devError("Failed to fetch user VM list for portforward filtering:", serversError);
            // VM 목록 조회 실패 시 빈 배열 반환 (보안 원칙: 실패 시 차단)
            return new NextResponse(JSON.stringify([]), { status: 200 });
        }

        const userVmIds = new Set<string>();
        const userVmIps = new Set<string>();

        for (const server of serversData.servers as Server[]) {
            if (server.id) userVmIds.add(server.id);
            if (Array.isArray(server.fixed_addresses)) {
                for (const ip of server.fixed_addresses) {
                    const ipStr = String(ip);
                    if (ip && ipStr !== "0.0.0.0") userVmIps.add(ipStr);
                }
            }
        }

        const { data, error } = await asUntypedClient(skylineClient).GET("/api/v1/portforward", {
            params: { query: params as Record<string, string | undefined> },
        });

        if (error) {
            logger.devError("Backend portforward error:", error);
            return new NextResponse(JSON.stringify([]), { status: 200 });
        }

        // 현재 사용자 VM에 속한 규칙만 반환 (VM ID 또는 내부망 IP 이중 검증)
        const rawList = Array.isArray(data) ? (data as PortForwardRule[]) : [];
        const filteredData = rawList.filter(
            (pf) =>
                (pf.user_vm_id && userVmIds.has(String(pf.user_vm_id))) ||
                (pf.user_vm_internal_ip && userVmIps.has(String(pf.user_vm_internal_ip)))
        );

        return new NextResponse(JSON.stringify(filteredData), { status: 200 });

    } catch (err) {
        logger.devError("Port Forward List API error:", err);
        return new NextResponse(JSON.stringify([]), { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = (await req.json()) as Partial<PortForwardCreateBody>;

        if (
            typeof body.rule_name !== "string" ||
            !body.rule_name.trim() ||
            body.rule_name.length > 255 ||
            typeof body.user_vm_id !== "string" ||
            !body.user_vm_id ||
            body.user_vm_id.length > 128 ||
            typeof body.user_vm_internal_ip !== "string" ||
            !body.user_vm_internal_ip ||
            body.user_vm_internal_ip.length > 45 ||
            (body.protocol !== "tcp" && body.protocol !== "udp") ||
            (body.service_type !== "ssh" && body.service_type !== "other")
        ) {
            return new NextResponse(JSON.stringify({ message: "포트포워딩 요청값이 올바르지 않습니다." }), { status: 400 });
        }

        if (!Number.isInteger(body.user_vm_internal_port) || body.user_vm_internal_port! < 1 || body.user_vm_internal_port! > 65535) {
            return new NextResponse(JSON.stringify({ message: "내부 포트는 1에서 65535 사이여야 합니다." }), { status: 400 });
        }

        if (
            body.proxy_external_port !== null &&
            body.proxy_external_port !== undefined &&
            (!Number.isInteger(body.proxy_external_port) || body.proxy_external_port < 1 || body.proxy_external_port > 65535)
        ) {
            return new NextResponse(JSON.stringify({ message: "외부 포트는 1에서 65535 사이여야 합니다." }), { status: 400 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);

        // 현재 사용자 토큰으로 조회한 서버 목록에서 VM과 내부 IP를 모두 검증한다.
        const { data: serversData, error: serversError } = await skylineClient.GET("/api/v1/extension/servers", {});
        const ownedServer = !serversError
            ? (serversData?.servers as Server[] | undefined)?.find((server) => server.id === body.user_vm_id)
            : undefined;
        const ownedIps = new Set(
            Array.isArray(ownedServer?.fixed_addresses)
                ? ownedServer.fixed_addresses.map((ip) => String(ip))
                : []
        );

        if (!ownedServer || !ownedIps.has(body.user_vm_internal_ip)) {
            logger.devError("POST portforward ownership check failed for vm_id:", body.user_vm_id);
            return new NextResponse(
                JSON.stringify({ message: "Forbidden: 해당 VM 또는 내부 IP에 대한 접근 권한이 없습니다." }),
                { status: 403 }
            );
        }

        const createBody: PortForwardCreateBody = {
            rule_name: body.rule_name.trim(),
            user_vm_id: body.user_vm_id,
            user_vm_name: String(ownedServer.name || ""),
            user_vm_internal_ip: body.user_vm_internal_ip,
            user_vm_internal_port: body.user_vm_internal_port!,
            protocol: body.protocol,
            service_type: body.service_type,
            proxy_external_port: body.proxy_external_port,
        };

        const untyped = asUntypedClient(skylineClient);
        const { data, error } = await untyped.POST("/api/v1/portforward", { body: createBody });

        if (error) {
            logger.devError("Backend error:", error);
            const statusCode =
                error && typeof error === "object" && "status" in error
                    ? Number((error as { status?: unknown }).status) || 500
                    : 500;
            return new NextResponse(JSON.stringify(error), { status: statusCode });
        }

        return new NextResponse(JSON.stringify(data), { status: 201 });

    } catch (err) {
        logger.devError("Port Forward Create API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward Create API failed" }), { status: 500 });
    }
}
