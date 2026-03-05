import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token || !session?.user?.id) {
            return new NextResponse(JSON.stringify({ message: "인증되지 않은 요청입니다." }), { status: 401 });
        }

        const body = await req.json();
        const { current_password, new_password } = body;

        if (!current_password || !new_password) {
            return new NextResponse(
                JSON.stringify({ message: "현재 비밀번호와 새 비밀번호를 입력해주세요." }),
                { status: 400 }
            );
        }

        const keystoneUrl = process.env.KEYSTONE_URL;
        if (!keystoneUrl) {
            return new NextResponse(
                JSON.stringify({ message: "서버 설정 오류: KEYSTONE_URL이 설정되지 않았습니다." }),
                { status: 500 }
            );
        }

        const userId = session.user.id;

        // Keystone Identity API v3: 사용자 비밀번호 변경
        const keystoneRes = await fetch(`${keystoneUrl}/v3/users/${userId}/password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": session.keystone_token,
            },
            body: JSON.stringify({
                user: {
                    password: new_password,
                    original_password: current_password,
                },
            }),
        });

        if (!keystoneRes.ok) {
            let errMsg = "비밀번호 변경에 실패했습니다.";
            try {
                const errData = await keystoneRes.json();
                errMsg = errData?.error?.message || errMsg;
            } catch { /* ignore */ }
            return new NextResponse(JSON.stringify({ message: errMsg }), { status: keystoneRes.status });
        }

        // Authentik 비밀번호 동기화 (실패해도 전체 흐름은 성공으로 처리)
        try {
            const authentikUrl = process.env.AUTHENTIK_URL;
            const authentikToken = process.env.AUTHENTIK_TOKEN;

            if (authentikUrl && authentikToken && session.user.name) {
                const searchRes = await fetch(
                    `${authentikUrl}/api/v3/core/users/?username=${encodeURIComponent(session.user.name)}`,
                    { headers: { Authorization: `Bearer ${authentikToken}` } }
                );

                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.results?.length > 0) {
                        const authentikUserId = searchData.results[0].pk;
                        await fetch(`${authentikUrl}/api/v3/core/users/${authentikUserId}/set_password/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authentikToken}`,
                            },
                            body: JSON.stringify({ password: new_password }),
                        });
                    }
                }
            }
        } catch (authentikError) {
            console.error("Authentik 비밀번호 동기화 실패 (비중요):", authentikError);
        }

        return new NextResponse(
            JSON.stringify({ message: "비밀번호가 성공적으로 변경되었습니다." }),
            { status: 200 }
        );
    } catch (err) {
        console.error("비밀번호 변경 오류:", err);
        return new NextResponse(
            JSON.stringify({ message: "비밀번호 변경 중 오류가 발생했습니다." }),
            { status: 500 }
        );
    }
}
