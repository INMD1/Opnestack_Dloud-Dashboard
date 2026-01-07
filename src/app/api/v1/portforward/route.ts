import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { instance_ip, external_port, internal_port } = await req.json();

        if (!instance_ip || !external_port || !internal_port) {
            return new NextResponse(JSON.stringify({ message: "Missing required parameters: instance_ip, external_port, internal_port" }), { status: 400 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // Assuming Skyline API has an endpoint for port forwarding
        const { data, error } = await skylineClient.POST("/api/v1/portforward", {
            body: {
                instance_ip,
                external_port,
                internal_port,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
        });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 201 });
    } catch (err) {
        console.error("Port Forward API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward API failed" }), { status: 500 });
    }
}