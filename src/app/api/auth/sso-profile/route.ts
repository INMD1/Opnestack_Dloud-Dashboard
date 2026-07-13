import { NextRequest, NextResponse } from "next/server";

// Skyline WebSSO 인증 후 브라우저의 Skyline 세션 쿠키만 전달해 keystone_token을 가져옴
export async function GET(req: NextRequest) {
    const configuredName = process.env.SKYLINE_SESSION_COOKIE_NAME || "session";
    const cookieName = /^[A-Za-z0-9_-]+$/.test(configuredName)
        ? configuredName
        : "session";
    const sessionCookie = req.cookies.get(cookieName)?.value;

    if (!sessionCookie) {
        return NextResponse.json(
            { error: "SSO 세션을 찾을 수 없습니다." },
            { status: 401, headers: { "Cache-Control": "no-store" } }
        );
    }

    try {
        const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/profile`, {
            headers: {
                Cookie: `${cookieName}=${sessionCookie}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "프로필 조회에 실패했습니다." },
                { status: res.status, headers: { "Cache-Control": "no-store" } }
            );
        }

        const data = await res.json();
        return NextResponse.json(data, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch {
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500, headers: { "Cache-Control": "no-store" } }
        );
    }
}
