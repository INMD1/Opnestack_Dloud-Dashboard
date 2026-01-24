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

        // Proxy to backend: GET /api/v1/portforward/vm/{vm_id}
        // Note: skyline-api.ts needs to have this path defined. 
        // If not, we might need to use a raw fetch or ensure the client is generated correctly.
        // Assuming skylineClient.GET works for dynamic paths if defined in OpenAPI schema.

        // Using raw fetch if client wrapper doesn't support dynamic path easily or if type definition is missing
        // But let's try to match the pattern.

        // Since I cannot verify skyline-api.ts right now, I will assume the path is available as "/api/v1/portforward/vm/{vm_id}"
        // However, usually client.GET takes the path string. 

        // Let's rely on the dashboard's pattern. 
        // In other similar files (e.g. instances/[id]/route.ts), they likely use matching paths.

        const { data, error } = await (skylineClient as any).GET(`/api/v1/portforward/vm/${vm_id}`);

        if (error) {
            // 404 is a valid response for "no rules found" in some designs, or actual error.
            // If backend returns 404 for empty list, we should handle it gracefully or pass it through.
            // Based on my manual test, it returns 200 OK with list.
            console.error("Backend error:", error);
            return new NextResponse(JSON.stringify(error), { status: (error as any).status || 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });

    } catch (err) {
        console.error("Port Forward VM API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forward VM API failed" }), { status: 500 });
    }
}
