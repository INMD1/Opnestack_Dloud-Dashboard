import { NextRequest, NextResponse } from "next/server";

// Skyline WebSSO 인증 후 브라우저 쿠키를 그대로 전달해 keystone_token을 가져옴
export async function GET(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie") ?? "";

    try {
        const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/profile`, {
            headers: {
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "프로필 조회에 실패했습니다." },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
