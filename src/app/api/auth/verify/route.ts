import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifiactionToken, Student_accept, pendingUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "토큰이 제공되지 않았습니다." },
                { status: 400 }
            );
        }

        // 토큰으로 데이터베이스에서 검색
        const tokenRecord = await db
            .select()
            .from(verifiactionToken)
            .where(eq(verifiactionToken.token, token))
            .limit(1);

        if (tokenRecord.length === 0) {
            return NextResponse.json(
                { error: "유효하지 않은 토큰입니다." },
                { status: 404 }
            );
        }

        const record = tokenRecord[0];

        // 토큰 생성 시간 확인 (24시간 이내인지)
        const createdAt = new Date(record.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            // 만료된 토큰 삭제
            await db
                .delete(verifiactionToken)
                .where(eq(verifiactionToken.token, token));

            // 관련 임시 사용자 정보도 삭제
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, token));

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
                .where(eq(verifiactionToken.token, token));
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, token));

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
            .where(eq(pendingUsers.token, token))
            .limit(1);

        if (pendingUserRecord.length === 0) {
            return NextResponse.json(
                { error: "회원가입 정보를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const userInfo = pendingUserRecord[0];

        // Skyline API로 실제 회원가입 처리
        try {
            const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/signup`;
            const signupResponse = await fetch(skylineUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userInfo.username,
                    password: userInfo.password,
                    name: userInfo.name,
                    email: userInfo.email,
                    student_id: userInfo.student_id,
                }),
            });

            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
                console.error("Skyline signup failed:", signupData);
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

            // 사용된 토큰과 임시 사용자 정보 삭제
            await db
                .delete(verifiactionToken)
                .where(eq(verifiactionToken.token, token));
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, token));

            return NextResponse.json({
                success: true,
                message: "학생 인증 및 회원가입이 완료되었습니다!",
                user_id: record.user_id,
                email: record.email,
                username: userInfo.username,
            });

        } catch (signupError) {
            console.error("Signup API error:", signupError);
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
