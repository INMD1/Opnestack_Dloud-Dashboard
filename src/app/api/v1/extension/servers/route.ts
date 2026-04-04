// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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

        // 쿼리 파라미터를 백엔드로 전달
        const searchParams = req.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const apiPath = queryString
            ? `/api/v1/extension/servers?${queryString}`
            : "/api/v1/extension/servers";

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET(apiPath, {});

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        logger.devError("List Servers API error:", err);
        return new NextResponse(JSON.stringify({ message: "List Servers API failed" }), { status: 500 });
    }
}