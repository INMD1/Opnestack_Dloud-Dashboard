import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifiactionToken, Student_accept, pendingUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptText, hashVerificationToken } from "@/lib/crypto-utils";

const TOKEN_REGEX = /^[0-9a-f]{64}$/i;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (typeof token !== "string" || !TOKEN_REGEX.test(token)) {
            return NextResponse.json(
                { error: "유효한 토큰이 제공되지 않았습니다." },
                { status: 400 }
            );
        }

        const hashedToken = hashVerificationToken(token);

        // 토큰으로 데이터베이스에서 검색
        const tokenRecord = await db
            .select()
            .from(verifiactionToken)
            .where(eq(verifiactionToken.token, hashedToken))
            .limit(1);

        // 배포 전에 발급된 원문 저장 토큰은 만료 시점(24시간)까지만 호환한다.
        if (tokenRecord.length === 0) {
            tokenRecord.push(...await db
                .select()
                .from(verifiactionToken)
                .where(eq(verifiactionToken.token, token))
                .limit(1));
        }

        if (tokenRecord.length === 0) {
            return NextResponse.json(
                { error: "유효하지 않은 토큰입니다." },
                { status: 404 }
            );
        }

        const record = tokenRecord[0];
        const storedToken = record.token;

        // 토큰 생성 시간 확인 (24시간 이내인지)
        const createdAt = new Date(record.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            // 만료된 토큰 삭제
            await db
                .delete(verifiactionToken)
                .where(eq(verifiactionToken.token, storedToken));

            // 관련 임시 사용자 정보도 삭제
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, storedToken));

            return NextResponse.json(
                { error: "토큰이 만료되었습니다. 다시 인증을 요청해주세요." },
                { status: 410 }
            );
        }

        // Student_accept에 이미 있는지 확인
        const existingAcceptance = await db
            .select()
            .from(Student_accept)
            .where(eq(Student_accept.user_id, record.user_id))
            .limit(1);

        if (existingAcceptance.length > 0) {
            // 이미 승인된 경우 - 토큰과 임시 데이터 삭제
            await db
                .delete(verifiactionToken)
                .where(eq(verifiactionToken.token, storedToken));
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, storedToken));

            return NextResponse.json({
                success: true,
                message: "이미 인증된 계정입니다.",
                alreadyVerified: true,
            });
        }

        // 임시 회원가입 정보 가져오기
        const pendingUserRecord = await db
            .select()
            .from(pendingUsers)
            .where(eq(pendingUsers.token, storedToken))
            .limit(1);

        if (pendingUserRecord.length === 0) {
            return NextResponse.json(
                { error: "회원가입 정보를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const userInfo = pendingUserRecord[0];

        // 외부 회원가입 호출 전에 토큰을 원자적으로 선점해 동시 재사용을 막는다.
        const claimedToken = await db
            .delete(verifiactionToken)
            .where(eq(verifiactionToken.token, storedToken))
            .returning();

        if (claimedToken.length !== 1) {
            return NextResponse.json(
                { error: "이미 사용되었거나 처리 중인 토큰입니다." },
                { status: 409 }
            );
        }

        // Skyline API로 실제 회원가입 처리
        try {
            // 암호화 저장된 비밀번호 복호화
            let plainPassword: string;
            try {
                plainPassword = decryptText(userInfo.password);
            } catch {
                console.error("Password decryption failed for user:", userInfo.username);
                await db.delete(pendingUsers).where(eq(pendingUsers.token, storedToken));
                return NextResponse.json(
                    { error: "회원가입 정보가 손상되었습니다. 다시 회원가입을 진행해주세요." },
                    { status: 500 }
                );
            }

            const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/signup`;
            const signupResponse = await fetch(skylineUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userInfo.username,
                    password: plainPassword,
                    name: userInfo.name,
                    email: userInfo.email,
                    student_id: userInfo.student_id,
                }),
            });

            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
                console.error("Skyline signup failed:", signupData);
                await db.delete(pendingUsers).where(eq(pendingUsers.token, storedToken));
                return NextResponse.json(
                    { error: signupData.message || "회원가입 처리에 실패했습니다." },
                    { status: signupResponse.status }
                );
            }

            // 회원가입 성공 - Student_accept 테이블에 추가
            await db.insert(Student_accept).values({
                user_id: record.user_id,
                email: record.email,
                acceptance: 1, // 승인됨
                created_at: new Date(),
            });

            // Authentik 유저 자동 생성 (실패해도 회원가입 성공 처리)
            try {
                const authentikUrl = process.env.AUTHENTIK_URL;
                const authentikToken = process.env.AUTHENTIK_TOKEN;

                if (authentikUrl && authentikToken) {
                    const createRes = await fetch(`${authentikUrl}/api/v3/core/users/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authentikToken}`,
                        },
                        body: JSON.stringify({
                            username: userInfo.username,
                            name: userInfo.name,
                            email: userInfo.email,
                            is_active: true,
                        }),
                    });

                    if (createRes.ok) {
                        const authentikUser = await createRes.json();
                        await fetch(`${authentikUrl}/api/v3/core/users/${encodeURIComponent(String(authentikUser.pk))}/set_password/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${authentikToken}`,
                            },
                            body: JSON.stringify({ password: plainPassword }),
                        });
                    }
                }
            } catch (authentikError) {
                console.error("Authentik user creation failed (non-critical):", authentikError);
            }

            // 선점한 인증 토큰은 이미 삭제되었으므로 임시 사용자 정보만 정리
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, storedToken));

            return NextResponse.json({
                success: true,
                message: "학생 인증 및 회원가입이 완료되었습니다!",
                user_id: record.user_id,
                email: record.email,
                username: userInfo.username,
            });

        } catch (signupError) {
            console.error("Signup API error:", signupError);
            await db.delete(pendingUsers).where(eq(pendingUsers.token, storedToken));
            return NextResponse.json(
                { error: "회원가입 API 호출 중 오류가 발생했습니다." },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Token verification error:", error);
        return NextResponse.json(
            { error: "인증 처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
