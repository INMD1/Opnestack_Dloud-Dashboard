// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";

function jsonResponse(data: unknown, status = 200) {
    return new NextResponse(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}


export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error, response } = await skylineClient.POST("/api/v1/instances", { body });

        if (error) {
            // 백엔드의 실제 상태 코드를 전달 (409 중복 이름 등)
            const statusCode = response?.status || 500;
            return new NextResponse(JSON.stringify(error), { status: statusCode });
        }

        return new NextResponse(JSON.stringify(data), { status: 202 });
    } catch (err) {
        logger.devError("Create Instance API error:", err);
        return new NextResponse(JSON.stringify({ message: "Create Instance API failed" }), { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const instance_id = searchParams.get('instance_id');
    if (!instance_id) {
        return new NextResponse(JSON.stringify({ message: "Missing instance_id" }), { status: 400 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET(`/api/v1/instances/${instance_id}`, {});

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        logger.devError("Get Instances API error:", err);
        return new NextResponse(JSON.stringify({ message: "Get Instances API failed" }), { status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    const instance_id = req.nextUrl.searchParams.get("instance_id");

    if (!instance_id) {
        return jsonResponse({ message: "Missing instance_id" }, 400);
    }

    try {
        const session = await getServerSession(authOptions);

        if (!session?.keystone_token) {
            return jsonResponse({ message: "Unauthorized" }, 401);
        }

        const skylineClient = getSkylineClient(session.keystone_token);

        const { data, error, response } = await skylineClient.DELETE(
            `/api/v1/instances/${instance_id}`,
            {}
        );

        if (error) {
            return jsonResponse(
                {
                    message: "Failed to delete instance",
                    error,
                },
                response?.status || 500
            );
        }

        return jsonResponse(data, 200);
    } catch (err) {
        logger.devError("Delete Instance API error:", err);
        return jsonResponse({ message: "Delete Instance API failed" }, 500);
    }
}