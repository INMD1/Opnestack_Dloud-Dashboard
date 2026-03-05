import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/sso`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json({ enable_sso: false, protocols: [] });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ enable_sso: false, protocols: [] });
    }
}
