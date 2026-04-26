import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { randomBytes } from "crypto";
import { verifiactionToken, pendingUsers, allowedEmails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email";
import { encryptText } from "@/lib/crypto-utils";

// 입력값 최대 길이 제한
const MAX_EMAIL_LENGTH = 254;
const MAX_USERNAME_LENGTH = 50;
const MAX_NAME_LENGTH = 100;
const MAX_STUDENT_ID_LENGTH = 20;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, student_id, name, username, password } = body;

        // 필수 필드 검증
        if (!email || !student_id || !name || !username || !password) {
            return NextResponse.json(
                { error: "모든 필드를 입력해주세요." },
                { status: 400 }
            );
        }

        // 타입 검증
        if (
            typeof email !== 'string' ||
            typeof student_id !== 'string' ||
            typeof name !== 'string' ||
            typeof username !== 'string' ||
            typeof password !== 'string'
        ) {
            return NextResponse.json(
                { error: "입력값이 올바르지 않습니다." },
                { status: 400 }
            );
        }

        // 길이 제한 검증 (DoS 방지)
        if (email.length > MAX_EMAIL_LENGTH) {
            return NextResponse.json({ error: "이메일이 너무 깁니다." }, { status: 400 });
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            return NextResponse.json({ error: "사용자 이름이 너무 깁니다. (최대 50자)" }, { status: 400 });
        }
        if (name.length > MAX_NAME_LENGTH) {
            return NextResponse.json({ error: "이름이 너무 깁니다. (최대 100자)" }, { status: 400 });
        }
        if (student_id.length > MAX_STUDENT_ID_LENGTH) {
            return NextResponse.json({ error: "학번이 너무 깁니다." }, { status: 400 });
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
            return NextResponse.json({ error: "비밀번호가 너무 깁니다. (최대 128자)" }, { status: 400 });
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "올바른 이메일 형식이 아닙니다." }, { status: 400 });
        }

        // 이메일 도메인 검증: 학교 이메일이거나 관리자가 허용한 이메일인지 확인
        const emailDomain = email.split('@')[1];
        const isSchoolEmail = emailDomain === 'office.deu.ac.kr';

        if (!isSchoolEmail) {
            const allowed = await db
                .select()
                .from(allowedEmails)
                .where(eq(allowedEmails.email, email.toLowerCase()))
                .limit(1);

            if (allowed.length === 0) {
                return NextResponse.json(
                    { error: "동의대학교 이메일(office.deu.ac.kr)이나 관리자가 허용한 이메일만 사용 가능합니다." },
                    { status: 400 }
                );
            }
        }

        // 보안 강화: 예측 불가능한 랜덤 토큰 생성 (이전의 SHA256(email+...) 방식 대체)
        const token = randomBytes(32).toString('hex');

        // 비밀번호 암호화 저장 (평문 저장 취약점 패치)
        const encryptedPassword = encryptText(password);

        // 데이터베이스에 인증 토큰 저장
        await db.insert(verifiactionToken).values({
            user_id: student_id,
            email: email,
            token: token,
            created_at: new Date(),
        });

        // 임시 회원가입 정보 저장 (비밀번호는 암호화하여 저장)
        await db.insert(pendingUsers).values({
            username: username,
            password: encryptedPassword,
            name: name,
            email: email,
            student_id: student_id,
            token: token,
            created_at: new Date(),
        });

        // 이메일 전송 시도
        try {
            await sendVerificationEmail(email, name, student_id, token);
            return NextResponse.json(
                {
                    success: true,
                    message: "인증 이메일이 성공적으로 전송되었습니다.",
                    email: email,
                },
                { status: 200 }
            );
        } catch (_error) {
            console.error("Email send failed:", _error);
            // 이메일 전송 실패 시 저장된 토큰과 임시 사용자 정보 삭제
            await db.delete(verifiactionToken).where(eq(verifiactionToken.token, token));
            await db.delete(pendingUsers).where(eq(pendingUsers.token, token));
            return NextResponse.json({ error: "이메일 전송에 실패했습니다." }, { status: 500 });
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
