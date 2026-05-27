/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";
import { logger } from "@/lib/logger";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isAdmin(userId: string): Promise<boolean> {
    const result = await db.select().from(admins).where(eq(admins.user_id, userId)).limit(1);
    return result.length > 0;
}

// 관리자 전용: 포트포워딩 규칙 삭제 (소유권 검증 없이 강제 삭제)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ rule_id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token || !session?.user?.id) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const adminStatus = await isAdmin(session.user.id);
        if (!adminStatus) {
            return new NextResponse(JSON.stringify({ message: "Forbidden: 관리자 권한이 필요합니다." }), { status: 403 });
        }

        const { rule_id } = await params;
        const skylineClient = getSkylineClient(session.keystone_token);

        const { error } = await (skylineClient as any).DELETE(`/api/v1/portforward/${rule_id}`);

        if (error) {
            logger.devError("Admin portforward DELETE error:", error);
            return new NextResponse(JSON.stringify({ message: "포트포워딩 삭제에 실패했습니다." }), { status: 500 });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        logger.devError("Admin portforward DELETE API error:", err);
        return new NextResponse(JSON.stringify({ message: "Admin portforward DELETE API failed" }), { status: 500 });
    }
}
