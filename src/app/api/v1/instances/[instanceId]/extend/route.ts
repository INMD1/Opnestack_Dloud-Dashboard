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

export async function POST(
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

    const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/instances/${instanceId}/extend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": session.keystone_token,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return jsonResponse(err, res.status);
    }

    const data = await res.json();
    return jsonResponse(data, 200);
  } catch (err) {
    logger.devError("Extend Instance API error:", err);
    return jsonResponse({ message: "Extend Instance API failed" }, 500);
  }
}
