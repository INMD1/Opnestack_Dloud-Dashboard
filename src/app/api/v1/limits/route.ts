import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET("/api/v1/limits");

        if (error) {
            logger.devError("Backend limits error:", error);
            return new NextResponse(JSON.stringify({ message: "Failed to fetch limits" }), { status: 502 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        logger.devError("Get Limit Summary API error:", err);
        return new NextResponse(JSON.stringify({ message: "Internal server error" }), { status: 500 });
    }
}
