import nodemailer from 'nodemailer';

function createTransporter() {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NEXT_APP_GOOGLEMAIL,
            pass: process.env.NEXT_APP_EMAILPASSWOPRD,
        },
    });
}

/** HTML 특수문자 이스케이프 (이메일 본문 XSS 방지) */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/** 이메일 인증 메일 발송 */
export async function sendVerificationEmail(
    email: string,
    name: string,
    studentId: string,
    token: string
): Promise<void> {
    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
    const supportEmail = process.env.NEXT_APP_GOOGLEMAIL || 'support@d-cloud.com';

    await transporter.sendMail({
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
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">D-Cloud Infra</h1>
                                        <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">학생 계정 인증</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">안녕하세요, ${escapeHtml(name)}님!</h2>
                                        <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">D-Cloud Infra 서비스 이용을 위한 학생 인증 요청을 받았습니다.</p>
                                        <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">아래 버튼을 클릭하여 인증을 완료해주세요.</p>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f7fafc; border-radius: 8px; overflow: hidden;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 100px;">학번:</td>
                                                            <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${escapeHtml(studentId)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 8px 0; color: #718096; font-size: 14px;">이메일:</td>
                                                            <td style="padding: 8px 0; color: #1a202c; font-size: 14px; font-weight: 600;">${escapeHtml(email)}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">계정 인증하기</a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 0 0 8px; color: #718096; font-size: 13px; line-height: 1.6;">버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
                                        <p style="margin: 0 0 30px; padding: 12px; background-color: #edf2f7; border-radius: 6px; color: #4a5568; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">${verificationLink}</p>
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
                                <tr>
                                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 8px; color: #718096; font-size: 13px; text-align: center;">문의사항이 있으시면 ${escapeHtml(supportEmail)}으로 연락주세요.</p>
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
    });
}

/**
 * 공지사항 등록 시 전체 회원에게 이메일 발송
 * 실패한 수신자는 로그로만 기록하며, 전체 발송을 중단하지 않음
 */
export async function sendAnnouncementEmails(
    recipients: string[],
    title: string,
    content: string,
    announcementId: number
): Promise<{ sent: number; failed: number }> {
    if (recipients.length === 0) return { sent: 0, failed: 0 };

    const transporter = createTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const announcementUrl = `${appUrl}/console/announcements/${announcementId}`;
    const supportEmail = process.env.NEXT_APP_GOOGLEMAIL || 'support@d-cloud.com';

    const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>D-Cloud Infra 공지사항</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            <!-- 헤더 -->
                            <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #06b6d4 0%, #0e7490 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">D-Cloud Infra</h1>
                                    <p style="margin: 10px 0 0; color: #cffafe; font-size: 14px;">새 공지사항이 등록되었습니다</p>
                                </td>
                            </tr>
                            <!-- 본문 -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 22px; font-weight: 700; border-left: 4px solid #06b6d4; padding-left: 16px;">${escapeHtml(title)}</h2>
                                    <div style="margin: 0 0 28px; padding: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${escapeHtml(content)}</p>
                                    </div>
                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td align="center">
                                                <a href="${announcementUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #06b6d4 0%, #0e7490 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">공지사항 전체 보기</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- 푸터 -->
                            <tr>
                                <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 6px; color: #718096; font-size: 12px; text-align: center;">이 메일은 D-Cloud Infra 서비스 공지사항 알림입니다.</p>
                                    <p style="margin: 0 0 6px; color: #718096; font-size: 12px; text-align: center;">문의: ${escapeHtml(supportEmail)}</p>
                                    <p style="margin: 0; color: #a0aec0; font-size: 11px; text-align: center;">&copy; 2026 D-Cloud Infra. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    const results = await Promise.allSettled(
        recipients.map(email =>
            transporter.sendMail({
                to: email,
                from: process.env.NEXT_APP_GOOGLEMAIL || '',
                subject: `[DCloud 공지] ${title}`,
                html,
            })
        )
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    const sent = results.length - failed;

    if (failed > 0) {
        console.error(`공지사항 이메일 발송 실패: ${failed}/${results.length}명`);
    }

    return { sent, failed };
}
