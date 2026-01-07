
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { project_id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { project_id } = params;
        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/switch_project/${project_id}`;

        const response = await fetch(skylineUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': session.keystone_token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return new NextResponse(JSON.stringify(data), { status: response.status });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Switch Project API error:", err);
        return new NextResponse(JSON.stringify({ message: "Switch Project API failed" }), { status: 500 });
    }
}
