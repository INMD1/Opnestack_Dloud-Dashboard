import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

function jsonResponse(data: any, status = 200) {
    return new NextResponse(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ instanceId: string }> }
) {
    try {
        const { instanceId } = await params;

        if (!instanceId) {
            return jsonResponse({ message: "Missing instanceId" }, 400);
        }

        const session = await getServerSession(authOptions);

        if (!session?.keystone_token) {
            return jsonResponse({ message: "Unauthorized" }, 401);
        }

        const skylineClient = getSkylineClient(session.keystone_token);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data, error, response } = await skylineClient.POST(
            `/api/v1/instances/${instanceId}/start`,
            {}
        );

        if (error) {
            return jsonResponse(
                {
                    message: "Failed to start instance",
                    error,
                },
                response?.status || 500
            );
        }

        return jsonResponse(data, 200);
    } catch (err) {
        console.error("Start Instance API error:", err);
        return jsonResponse({ message: "Start Instance API failed" }, 500);
    }
}
