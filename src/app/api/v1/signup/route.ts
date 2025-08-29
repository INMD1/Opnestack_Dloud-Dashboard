
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/signup`;
        const body = await req.json();

        const response = await fetch(skylineUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return new NextResponse(JSON.stringify(data), { status: response.status });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("Signup API error:", err);
        return new NextResponse(JSON.stringify({ message: "Signup API failed" }), { status: 500 });
    }
}
