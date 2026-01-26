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

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await (skylineClient as any).GET("/api/v1/portforward");

        if (error) {
            logger.devError("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: (error as any).status || 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });

    } catch (err) {
        logger.devError("Port Forward List API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward List API failed" }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
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
