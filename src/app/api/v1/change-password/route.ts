import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

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

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error, response } = await (skylineClient as any).POST("/api/v1/change-password", { body: {
                user: {
                    password: new_password,
                    original_password: current_password,
                },
            } });
  
        if (error) {
            let errMsg = "비밀번호 변경에 실패했습니다.";
            if (typeof error === "object" && error !== null) {
                errMsg = (error as any)?.error?.message || (error as any)?.message || errMsg;
            }
            const statusCode = response?.status || 500;
            return new NextResponse(JSON.stringify({ message: errMsg }), { status: statusCode });
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
                        await fetch(`${authentikUrl}/api/v3/core/users/${encodeURIComponent(String(authentikUserId))}/set_password/`, {
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
