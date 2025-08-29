
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/portforward`;
        const body = await req.json();

        const response = await fetch(skylineUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session.keystone_token,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return new NextResponse(JSON.stringify(data), { status: response.status });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Port Forwarding API error:", err);
        return new NextResponse(JSON.stringify({ message: "Port Forwarding API failed" }), { status: 500 });
    }
}
