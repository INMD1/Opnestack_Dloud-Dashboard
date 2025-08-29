
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/port_forwardings`;
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
        console.error("Add Port Forwarding API error:", err);
        return new NextResponse(JSON.stringify({ message: "Add Port Forwarding API failed" }), { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/port_forwardings`;
        const body = await req.json();

        const response = await fetch(skylineUrl, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': session.keystone_token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const data = await response.json();
            return new NextResponse(JSON.stringify(data), { status: response.status });
        }

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Delete Port Forwarding API error:", err);
        return new NextResponse(JSON.stringify({ message: "Delete Port Forwarding API failed" }), { status: 500 });
    }
}
