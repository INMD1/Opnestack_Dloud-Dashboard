import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { createHash } from "crypto";
import { verifiactionToken, pendingUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import nodemailer from 'nodemailer';

type MailOptionType = {
    to: string;
    from: string;
    subject: string;
    html: string;
};

function sendMail(email: string, name: string, studentId: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NEXT_APP_GOOGLEMAIL,
            pass: process.env.NEXT_APP_EMAILPASSWOPRD,
        },
    });

    // 인증 링크 생성 (실제 도메인으로 변경 필요)
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

    const mailOptions: MailOptionType = {
        to: email,
        from: process.env.NEXT_APP_GOOGLEMAIL || '',
        subject: `D-Cloud Infra 학생 인증링크 전송`,
        html: `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>D-Cloud Infra 학생 인증</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- 헤더 -->
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">D-Cloud Infra</h1>
                                        <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">학생 계정 인증</p>
                                    </td>
                                </tr>
                                
                                <!-- 본문 -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">안녕하세요, ${name}님!</h2>
                                        <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">D-Cloud Infra 서비스 이용을 위한 학생 인증 요청을 받았습니다.</p>
                                        <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">아래 버튼을 클릭하여 인증을 완료해주세요.</p>
                                        
                                        <!-- 인증 정보 박스 -->
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f7fafc; border-radius: 8px; overflow: hidden;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 100px;">학번:</td>
                                                            <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${studentId}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #718096; font-size: 14px;">이메일:</td>
                                                            <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${email}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- 인증 버튼 -->
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">계정 인증하기</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- 링크 대체 텍스트 -->
                                        <p style="margin: 0 0 8px; color: #718096; font-size: 13px; line-height: 1.6;">버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
                                        <p style="margin: 0 0 30px; padding: 12px; background-color: #edf2f7; border-radius: 6px; color: #4a5568; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">${verificationLink}</p>
                                        
                                        <!-- 주의사항 -->
                                        <div style="padding: 20px; background-color: #fff5f5; border-left: 4px solid #fc8181; border-radius: 4px; margin-bottom: 20px;">
                                            <p style="margin: 0; color: #c53030; font-size: 14px; line-height: 1.6;"><strong>⚠️ 주의사항:</strong></p>
                                            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #742a2a; font-size: 13px; line-height: 1.6;">
                                                <li>이 링크는 보안을 위해 24시간 동안만 유효합니다.</li>
                                                <li>본인이 요청하지 않았다면 이 이메일을 무시하세요.</li>
                                                <li>링크를 타인과 공유하지 마세요.</li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- 푸터 -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 8px; color: #718096; font-size: 13px; text-align: center;">문의사항이 있으시면 ${process.env.NEXT_APP_EMAIL || 'support@d-cloud.com'}으로 연락주세요.</p>
                                        <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">&copy; 2026 D-Cloud Infra. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    };
    return transporter.sendMail(mailOptions);
}
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

        // 이메일 도메인 검증
        const emailDomain = email.split('@')[1];
        if (emailDomain !== 'office.deu.ac.kr') {
            return NextResponse.json(
                { error: "동서대학교 이메일(office.deu.ac.kr)만 사용 가능합니다." },
                { status: 400 }
            );
        }

        // 토큰 생성 (Node.js crypto 사용)
        const token = createHash('sha256')
            .update(email + student_id + name + username + Date.now())
            .digest('hex');

        //데이터베이스에 인증 토큰 저장
        await db.insert(verifiactionToken).values({
            user_id: student_id,
            email: email,
            token: token,
            created_at: new Date(),
        });

        //임시 회원가입 정보 저장
        await db.insert(pendingUsers).values({
            username: username,
            password: password, // 원본 비밀번호 저장 (나중에 Skyline API로 전송)
            name: name,
            email: email,
            student_id: student_id,
            token: token,
            created_at: new Date(),
        });

        //이메일 전송 시도
        try {
            //html넣어서 링크로 이동하게 유도
            await sendMail(email, name, student_id, token);
            return NextResponse.json(
                {
                    success: true,
                    message: "인증 이메일이 성공적으로 전송되었습니다.",
                    email: email,
                },
                { status: 200 }
            );
        } catch (error) {
            // 에러 나면 방금 넣은 토큰과 임시 사용자 정보 삭제
            await db
                .delete(verifiactionToken)
                .where(eq(verifiactionToken.token, token));
            await db
                .delete(pendingUsers)
                .where(eq(pendingUsers.token, token));
            return NextResponse.json({ error: "이메일 전송에 실패했습니다." }, { status: 500 });
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "회원가입 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
