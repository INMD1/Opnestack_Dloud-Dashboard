
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/profile`;

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
        logger.devError("Profile API error:", err);
        return new NextResponse(JSON.stringify({ message: "Profile API failed" }), { status: 500 });
    }
}
