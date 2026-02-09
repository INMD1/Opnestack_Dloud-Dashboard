// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized", project_logs: [] }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET(`/api/v1/projectlogs`, {});

        if (error) {
            logger.devError("Backend projectlogs error:", error);
            // Return empty array instead of error to prevent frontend crashes
            return new NextResponse(JSON.stringify({ project_logs: [] }), { status: 200 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        logger.devError("Get Project Logs API error:", err);
        // Return empty array instead of error to prevent frontend crashes
        return new NextResponse(JSON.stringify({ project_logs: [] }), { status: 200 });
    }
}