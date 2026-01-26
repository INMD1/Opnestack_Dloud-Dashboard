// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET(`/api/v1/projectlogs`, {});

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Get Instances API error:", err);
        return new NextResponse(JSON.stringify({ message: "Get Instances API failed" }), { status: 500 });
    }
}