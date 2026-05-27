/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
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

// 관리자 전용: 전체 포트포워딩 규칙 조회 (필터링 없음)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token || !session?.user?.id) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const adminStatus = await isAdmin(session.user.id);
        if (!adminStatus) {
            return new NextResponse(JSON.stringify({ message: "Forbidden: 관리자 권한이 필요합니다." }), { status: 403 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await (skylineClient as any).GET("/api/v1/portforward", {});

        if (error) {
            logger.devError("Admin portforward GET error:", error);
            return new NextResponse(JSON.stringify([]), { status: 200 });
        }

        return new NextResponse(JSON.stringify(data ?? []), { status: 200 });

    } catch (err) {
        logger.devError("Admin portforward GET API error:", err);
        return new NextResponse(JSON.stringify([]), { status: 200 });
    }
}
