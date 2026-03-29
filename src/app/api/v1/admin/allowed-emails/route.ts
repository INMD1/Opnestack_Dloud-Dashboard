import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { admins, allowedEmails } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function isAdmin(userId: string): Promise<boolean> {
    const admin = await db
        .select()
        .from(admins)
        .where(eq(admins.user_id, userId))
        .limit(1);
    return admin.length > 0;
}

// 허용 이메일 목록 조회
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const emails = await db.select().from(allowedEmails).orderBy(allowedEmails.created_at);
        return NextResponse.json({ emails });
    } catch (error) {
        console.error('Allowed emails fetch error:', error);
        return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 허용 이메일 추가
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { email, description } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: '유효한 이메일 형식이 아닙니다.' }, { status: 400 });
        }

        const existing = await db
            .select()
            .from(allowedEmails)
            .where(eq(allowedEmails.email, email.toLowerCase()))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 409 });
        }

        const [created] = await db.insert(allowedEmails).values({
            email: email.toLowerCase(),
            description: description || null,
            added_by: session.user.id,
            created_at: new Date(),
        }).returning();

        return NextResponse.json({ email: created }, { status: 201 });
    } catch (error) {
        console.error('Allowed email add error:', error);
        return NextResponse.json({ error: '추가 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
