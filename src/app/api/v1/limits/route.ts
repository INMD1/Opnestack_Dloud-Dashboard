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
            // Return default quota structure to prevent frontend crashes
            return new NextResponse(JSON.stringify(getDefaultQuotas()), { status: 200 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        logger.devError("Get Limit Summary API error:", err);
        // Return default quota structure to prevent frontend crashes
        return new NextResponse(JSON.stringify(getDefaultQuotas()), { status: 200 });
    }
}

function getDefaultQuotas() {
    const defaultQuota = { in_use: 0, limit: 0, reserved: 0 };
    return {
        quotas: {
            instances: defaultQuota,
            cores: defaultQuota,
            ram: defaultQuota,
            volumes: defaultQuota,
            snapshots: defaultQuota,
            gigabytes: defaultQuota,
            floatingip: defaultQuota,
            network: defaultQuota,
            port: defaultQuota,
            router: defaultQuota,
            subnet: defaultQuota,
            security_group: defaultQuota,
            security_group_rule: defaultQuota,
            port_forwardings: defaultQuota,
        }
    };
}