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

// 허용 이메일 삭제
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const { id } = await params;
        const emailId = parseInt(id);
        if (isNaN(emailId)) {
            return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
        }

        const existing = await db
            .select()
            .from(allowedEmails)
            .where(eq(allowedEmails.id, emailId))
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json({ error: '존재하지 않는 이메일입니다.' }, { status: 404 });
        }

        await db.delete(allowedEmails).where(eq(allowedEmails.id, emailId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Allowed email delete error:', error);
        return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
