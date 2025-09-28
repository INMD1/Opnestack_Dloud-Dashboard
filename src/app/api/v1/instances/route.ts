import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSkylineClient } from "@/lib/skyline";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.POST("/api/v1/instances", { body });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        let instanceIp = null;
        if (data && data.instance && data.instance.addresses) {
            // Assuming the first network's first IP is the internal IP
            const networkNames = Object.keys(data.instance.addresses);
            if (networkNames.length > 0) {
                const firstNetwork = data.instance.addresses[networkNames[0]];
                if (firstNetwork.length > 0) {
                    instanceIp = firstNetwork[0].addr;
                }
            }
        }

        return new NextResponse(JSON.stringify({ ...data, instance_ip: instanceIp }), { status: 202 });
    } catch (err) {
        console.error("Create Instance API error:", err);
        return new NextResponse(JSON.stringify({ message: "Create Instance API failed" }), { status: 500 });
    }
}