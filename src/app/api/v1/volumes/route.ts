import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function jsonResponse(data: any, status = 200) {
    return new NextResponse(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function DELETE(req: NextRequest) {
    try {
        const volumeName = req.nextUrl.searchParams.get("volume_name");

        if (!volumeName) {
            return  jsonResponse({ message: "Missing volume_name" }, 400);
        }

        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return jsonResponse({ message: "Unauthorized" }, 401);
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data, error } = await skylineClient.DELETE(`/api/v1/volumes/${volumeName}`);

        if (error) {
            return jsonResponse({ message: "Volume deletion failed" }, 500);
        }

        return jsonResponse({ message: "Volume deleted successfully" }, 200);
    } catch (err) {
        console.error("Volume deletion API error:", err);
        return jsonResponse({ message: "Volume deletion API failed" }, 500);
    }
}