import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.keystone_token) {
            logger.debug("Logging out with token type:", typeof session.keystone_token);

            await fetch(`${process.env.SKYLINE_API_URL}/api/v1/logout`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    region: "RegionOne",
                    keystone_token: session.keystone_token,
                })
            });
        }
        return new Response(JSON.stringify({ message: "Logged out" }), { status: 200 });
    } catch (err) {
        logger.devError("Logout error:", err);
        return new Response(JSON.stringify({ message: "Logout failed" }), { status: 500 });
    }
}
