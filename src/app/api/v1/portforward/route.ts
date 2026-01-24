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

        const body = await req.json();

        // Basic validation - let backend handle detailed validation
        if (!body.user_vm_internal_ip || !body.user_vm_internal_port || !body.user_vm_id) {
            return new NextResponse(JSON.stringify({ message: "Missing required parameters" }), { status: 400 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.POST("/api/v1/portforward", {
            body: body as any,
        });

        if (error) {
            console.error("Backend error:", error);
            // Propagate backend error message if available
            const errorMessage = (error as any).detail || (error as any).message || "Port Forward API failed";
            return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 201 });
    } catch (err) {
        console.error("Port Forward API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward API failed in Dashboard" }), { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // Cast to any to bypass outdated type definition (backend supports GET but types say never)
        const { data, error } = await (skylineClient as any).GET("/api/v1/portforward");

        if (error) {
            console.error("Backend error:", error);
            const errorMessage = (error as any).detail || (error as any).message || "Port Forward API failed";
            return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Port Forward API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward API failed in Dashboard" }), { status: 500 });
    }
}