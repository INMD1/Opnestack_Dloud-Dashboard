import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 현재 로그인한 사용자가 관리자인지 확인
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { isAdmin: false, error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // admins 테이블에서 user_id로 조회
        const admin = await db
            .select()
            .from(admins)
            .where(eq(admins.user_id, userId))
            .limit(1);

        const isAdmin = admin.length > 0;

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json(
            { isAdmin: false, error: '관리자 확인 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
