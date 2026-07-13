import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Student_accept } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { keystone_token, student_id } = await req.json();

        if (
            typeof keystone_token !== "string" ||
            typeof student_id !== "string" ||
            student_id.length < 1 ||
            student_id.length > 20
        ) {
            return NextResponse.json(
                { error: "필수 정보가 없습니다." },
                { status: 400 }
            );
        }

        // Skyline으로 토큰 유효성 검증
        const profileRes = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/profile`, {
            headers: { Authorization: keystone_token },
            cache: "no-store",
        });

        if (!profileRes.ok) {
            return NextResponse.json(
                { error: "유효하지 않은 인증 토큰입니다. 다시 로그인해주세요." },
                { status: 401 }
            );
        }

        const profile = await profileRes.json();
        const verifiedUserId = profile?.user?.id;
        const verifiedEmail = profile?.user?.email;

        if (
            typeof verifiedUserId !== "string" ||
            !verifiedUserId ||
            typeof verifiedEmail !== "string" ||
            !verifiedEmail
        ) {
            return NextResponse.json(
                { error: "인증된 사용자 정보를 확인할 수 없습니다." },
                { status: 401 }
            );
        }

        // 이미 등록된 사용자 확인
        const existing = await db
            .select()
            .from(Student_accept)
            .where(eq(Student_accept.user_id, verifiedUserId))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ success: true, alreadyRegistered: true });
        }

        await db.insert(Student_accept).values({
            user_id: verifiedUserId,
            email: verifiedEmail.toLowerCase(),
            acceptance: 1,
            created_at: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("SSO register complete error:", err);
        return NextResponse.json(
            { error: "처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
