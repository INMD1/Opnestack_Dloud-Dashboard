import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const instance_id = searchParams.get('instance_id');
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data, error } = await skylineClient.POST(`/api/v1/instances/${instance_id}/console`, {
            body: {
                console_type: "novnc"
            }
        });
        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        } else {
            return new NextResponse(JSON.stringify(data), { status: 200 });
        }
       
    } catch (err) {
        console.error("Create Instance API error:", err);
        return new NextResponse(JSON.stringify({ message: "Create Instance API failed" }), { status: 500 });
    }
}