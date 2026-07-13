import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

function jsonResponse(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const { instanceId } = await params;

    if (!instanceId) {
      return jsonResponse({ message: "Missing instanceId" }, 400);
    }

    const session = await getServerSession(authOptions);

    if (!session?.keystone_token) {
      return jsonResponse({ message: "Unauthorized" }, 401);
    }

    // skylineClient를 사용하지 않고 직접 fetch (타입 이슈 방지)
    const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/instances/${encodeURIComponent(instanceId)}/lifecycle`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": session.keystone_token,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return jsonResponse({ detail: "Lifecycle feature not enabled or instance not found" }, 404);
      }
      const err = await res.json();
      return jsonResponse(err, res.status);
    }

    const data = await res.json();
    return jsonResponse(data, 200);
  } catch (err) {
    logger.devError("Get Instance Lifecycle API error:", err);
    return jsonResponse({ message: "Get Instance Lifecycle API failed" }, 500);
  }
}
