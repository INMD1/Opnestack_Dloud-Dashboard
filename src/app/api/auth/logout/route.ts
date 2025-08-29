//@ts-nocheck
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.keystone_token) {
            console.log(typeof session.keystone_token
            );

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
        console.error("Logout error:", err);
        return new Response(JSON.stringify({ message: "Logout failed" }), { status: 500 });
    }
}
