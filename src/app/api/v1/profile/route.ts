
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

        if (!response.ok) {
            logger.devError(`Profile API returned status ${response.status}`);
            if (response.status === 401) {
                return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
            }
            // Return empty profile to prevent frontend crashes
            return new NextResponse(JSON.stringify({}), { status: 200 });
        }

        try {
            const data = await response.json();
            return new NextResponse(JSON.stringify(data), { status: 200 });
        } catch (parseError) {
            logger.devError("Failed to parse profile response:", parseError);
            return new NextResponse(JSON.stringify({}), { status: 200 });
        }
    } catch (err) {
        logger.devError("Profile API error:", err);
        // Return empty profile to prevent frontend crashes
        return new NextResponse(JSON.stringify({}), { status: 200 });
    }
}
