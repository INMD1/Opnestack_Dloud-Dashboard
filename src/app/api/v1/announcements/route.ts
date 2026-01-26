import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { admins, announcements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// 관리자 여부 확인 헬퍼 함수
async function isAdmin(userId: string): Promise<boolean> {
    const admin = await db
        .select()
        .from(admins)
        .where(eq(admins.user_id, userId))
        .limit(1);
    return admin.length > 0;
}

// 공지사항 목록 조회 (모든 사용자)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const announcementList = await db
            .select()
            .from(announcements)
            .where(eq(announcements.is_active, 1))
            .orderBy(desc(announcements.created_at))
            .limit(limit)
            .offset(offset);

        return NextResponse.json({
            announcements: announcementList,
            count: announcementList.length
        });
    } catch (error) {
        console.error('Announcements GET error:', error);
        return NextResponse.json(
            { error: '공지사항 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 공지사항 생성 (관리자만)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const userName = session.user.name || 'Unknown';

        // 관리자 확인
        if (!(await isAdmin(userId))) {
            return NextResponse.json(
                { error: '관리자만 공지사항을 작성할 수 있습니다.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: '제목과 내용을 입력해주세요.' },
                { status: 400 }
            );
        }

        const newAnnouncement = await db
            .insert(announcements)
            .values({
                title,
                content,
                author_id: userId,
                author_name: userName,
                created_at: new Date(),
                is_active: 1
            })
            .returning();

        return NextResponse.json({
            message: '공지사항이 등록되었습니다.',
            announcement: newAnnouncement[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Announcements POST error:', error);
        return NextResponse.json(
            { error: '공지사항 등록 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
