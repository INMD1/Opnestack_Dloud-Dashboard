import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
            return jsonResponse({ message: "Unauthorized" }, 401);
        }

        const body = await req.json();
        const { volume_id, server_id } = body;

        if (!volume_id || !server_id) {
            return jsonResponse({ message: "Missing volume_id or server_id" }, 400);
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data, error } = await skylineClient.POST(`/api/v1/volumes/${volume_id}/detach`, {
            body: { server_id }
        });

        if (error) {
            console.error("Volume detach error:", error);
            return jsonResponse({ message: "Volume detach failed", error }, 500);
        }

        return jsonResponse({ message: "Volume detached successfully", data }, 200);
    } catch (err) {
        console.error("Volume detach API error:", err);
        return jsonResponse({ message: "Volume detach API failed" }, 500);
    }
}
