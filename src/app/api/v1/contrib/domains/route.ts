
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/contrib/domains`;

        const response = await fetch(skylineUrl, {
            method: "GET",
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
        console.error("Domains API error:", err);
        return new NextResponse(JSON.stringify({ message: "Domains API failed" }), { status: 500 });
    }
}
