import { NextResponse } from "next/server";

// 실제 가입은 이메일 토큰을 검증하는 /api/auth/verify 에서만 수행한다.
// 이 프록시를 열어두면 인증된 사용자가 이메일 검증 없이 계정을 만들 수 있다.
export async function POST() {
    return NextResponse.json(
        { message: "이메일 인증을 통해 회원가입을 완료해주세요." },
        { status: 403 }
    );
}
