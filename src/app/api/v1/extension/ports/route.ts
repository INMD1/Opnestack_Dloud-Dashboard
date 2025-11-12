import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);

        // The openapi-fetch client does not support passing searchParams directly in the way the old code did.
        // We need to construct the path with query parameters manually if we want to pass them.
        // However, the GET operation for /api/v1/extension/ports does not define any parameters in the OpenAPI spec.
        // So, we will call it without any parameters.
        const { data, error } = await skylineClient.GET("/api/v1/extension/ports");

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("List Ports API error:", err);
        return new NextResponse(JSON.stringify({ message: "List Ports API failed" }), { status: 500 });
    }
}