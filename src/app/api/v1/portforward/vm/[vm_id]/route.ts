/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function GET(req: NextRequest, { params }: { params: Promise<{ vm_id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { vm_id } = await params;
        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await (skylineClient as any).GET(`/api/v1/portforward/vm/${vm_id}`);

        if (error) {
            console.error("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: (error as any).status || 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });

    } catch (err) {
        console.error("Port Forward VM API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward VM API failed" }), { status: 500 });
    }
}
