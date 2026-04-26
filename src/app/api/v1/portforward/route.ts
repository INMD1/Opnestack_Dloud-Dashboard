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
        const { data, error } = await (skylineClient as any).GET("/api/v1/portforward", {
            params: { query: params }
        });

        if (error) {
            logger.devError("Backend portforward error:", error);
            // Return empty array to prevent frontend crashes
            return new NextResponse(JSON.stringify([]), { status: 200 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });

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

        // 외부 포트 검증 (1~1000)
        if (body.proxy_external_port !== null && body.proxy_external_port !== undefined) {
            const port = parseInt(body.proxy_external_port);
            if (isNaN(port) || port < 1 || port > 1000) {
                return new NextResponse(JSON.stringify({ message: "외부 포트는 1에서 1000 사이여야 합니다." }), { status: 400 });
            }
        }

        const skylineClient = getSkylineClient(session.keystone_token);
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
