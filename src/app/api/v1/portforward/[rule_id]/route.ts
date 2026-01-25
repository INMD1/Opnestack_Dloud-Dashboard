/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ rule_id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { rule_id } = await params;
        const skylineClient = getSkylineClient(session.keystone_token);

        const { error } = await (skylineClient as any).DELETE(`/api/v1/portforward/${rule_id}`);

        if (error) {
            console.error("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        console.error("Port Forward Delete API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward Delete API failed" }), { status: 500 });
    }
}
