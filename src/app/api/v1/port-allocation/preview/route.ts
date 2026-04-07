import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

/**
 * 포트 할당 미리보기 API
 * GET /api/v1/port-allocation/preview
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const serviceType = searchParams.get("service_type");

        const skylineClient = getSkylineClient(session.keystone_token);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data, error } = await skylineClient.GET("/api/v1/port-allocation/preview", {
            params: {
                query: {
                    service_type: serviceType as any
                }
            }
        });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Port Allocation Preview API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Allocation Preview API failed" }), { status: 500 });
    }
}
