import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { admins, announcements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 관리자 여부 확인 헬퍼 함수
async function isAdmin(userId: string): Promise<boolean> {
    const admin = await db
        .select()
        .from(admins)
        .where(eq(admins.user_id, userId))
        .limit(1);
    return admin.length > 0;
}

// 단일 공지사항 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const announcementId = parseInt(id);

        if (isNaN(announcementId)) {
            return NextResponse.json(
                { error: '유효하지 않은 공지사항 ID입니다.' },
                { status: 400 }
            );
        }

        const announcement = await db
            .select()
            .from(announcements)
            .where(and(
                eq(announcements.id, announcementId),
                eq(announcements.is_active, 1)
            ))
            .limit(1);

        if (announcement.length === 0) {
            return NextResponse.json(
                { error: '공지사항을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ announcement: announcement[0] });
    } catch (error) {
        console.error('Announcement GET error:', error);
        return NextResponse.json(
            { error: '공지사항 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 공지사항 수정 (관리자만)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json(
                { error: '관리자만 공지사항을 수정할 수 있습니다.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const announcementId = parseInt(id);

        if (isNaN(announcementId)) {
            return NextResponse.json(
                { error: '유효하지 않은 공지사항 ID입니다.' },
                { status: 400 }
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

        const updated = await db
            .update(announcements)
            .set({
                title,
                content,
                updated_at: new Date()
            })
            .where(eq(announcements.id, announcementId))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json(
                { error: '공지사항을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: '공지사항이 수정되었습니다.',
            announcement: updated[0]
        });
    } catch (error) {
        console.error('Announcement PUT error:', error);
        return NextResponse.json(
            { error: '공지사항 수정 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 공지사항 삭제 (관리자만, soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 }
            );
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json(
                { error: '관리자만 공지사항을 삭제할 수 있습니다.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const announcementId = parseInt(id);

        if (isNaN(announcementId)) {
            return NextResponse.json(
                { error: '유효하지 않은 공지사항 ID입니다.' },
                { status: 400 }
            );
        }

        // Soft delete
        const deleted = await db
            .update(announcements)
            .set({ is_active: 0 })
            .where(eq(announcements.id, announcementId))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: '공지사항을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: '공지사항이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Announcement DELETE error:', error);
        return NextResponse.json(
            { error: '공지사항 삭제 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
