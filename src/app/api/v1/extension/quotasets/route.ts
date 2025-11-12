
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/extension/quotasets?${searchParams.toString()}`;

        const response = await fetch(skylineUrl, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session.keystone_token,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return new NextResponse(JSON.stringify(data), { status: response.status });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("List Quotas API error:", err);
        return new NextResponse(JSON.stringify({ message: "List Quotas API failed" }), { status: 500 });
    }
}
