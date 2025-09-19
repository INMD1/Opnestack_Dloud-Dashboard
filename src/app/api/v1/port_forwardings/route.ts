import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSkylineClient } from "@/lib/skyline";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // NOTE: The openapi spec does not define a GET method for /api/v1/port_forwardings
        // Assuming this is a custom endpoint or a mistake in the original code.
        // We will try to call it and see what happens.
        const { data, error } = await skylineClient.GET("/api/v1/port_forwardings");

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("List Port Forwardings API error:", err);
        return new NextResponse(JSON.stringify({ message: "List Port Forwardings API failed" }), { status: 500 });
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
        const { data, error } = await skylineClient.POST("/api/v1/port_forwardings", { body });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Add Port Forwarding API error:", err);
        return new NextResponse(JSON.stringify({ message: "Add Port Forwarding API failed" }), { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.DELETE("/api/v1/port_forwardings", { body });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Delete Port Forwarding API error:", err);
        return new NextResponse(JSON.stringify({ message: "Delete Port Forwarding API failed" }), { status: 500 });
    }
}