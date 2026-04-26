import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { admins, announcements, Student_accept } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sendAnnouncementEmails } from '@/lib/email';

// 입력값 길이 제한
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;

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

        // limit: 1~100 범위 강제 (DoS 방지)
        const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
        const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);

        // offset: 0 이상 강제
        const rawOffset = parseInt(searchParams.get('offset') || '0', 10);
        const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

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
        const { title, content, sendEmail } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: '제목과 내용을 입력해주세요.' },
                { status: 400 }
            );
        }

        // 타입 및 길이 검증
        if (typeof title !== 'string' || typeof content !== 'string') {
            return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 });
        }
        if (title.trim().length === 0) {
            return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
        }
        if (title.length > MAX_TITLE_LENGTH) {
            return NextResponse.json(
                { error: `제목은 ${MAX_TITLE_LENGTH}자 이내로 입력해주세요.` },
                { status: 400 }
            );
        }
        if (content.trim().length === 0) {
            return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
        }
        if (content.length > MAX_CONTENT_LENGTH) {
            return NextResponse.json(
                { error: `내용은 ${MAX_CONTENT_LENGTH.toLocaleString()}자 이내로 입력해주세요.` },
                { status: 400 }
            );
        }

        const newAnnouncement = await db
            .insert(announcements)
            .values({
                title: title.trim(),
                content,
                author_id: userId,
                author_name: userName,
                created_at: new Date(),
                is_active: 1
            })
            .returning();

        const created = newAnnouncement[0];

        // 이메일 발송 옵션이 true일 때만 전체 회원에게 발송
        if (sendEmail === true) {
            // 비동기 fire-and-forget: 이메일 실패가 공지 등록을 막지 않음
            (async () => {
                try {
                    const acceptedUsers = await db
                        .select({ email: Student_accept.email })
                        .from(Student_accept)
                        .where(eq(Student_accept.acceptance, 1));

                    const emails = acceptedUsers.map(u => u.email).filter(Boolean);

                    if (emails.length > 0) {
                        const result = await sendAnnouncementEmails(emails, created.title, created.content, created.id);
                        console.log(`공지사항 이메일 발송 완료: ${result.sent}명 성공, ${result.failed}명 실패`);
                    }
                } catch (emailError) {
                    console.error('공지사항 이메일 발송 중 오류:', emailError);
                }
            })();
        }

        return NextResponse.json({
            message: '공지사항이 등록되었습니다.',
            announcement: created
        }, { status: 201 });
    } catch (error) {
        console.error('Announcements POST error:', error);
        return NextResponse.json(
            { error: '공지사항 등록 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
