import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.keystone_token) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const skylineUrl = `${process.env.SKYLINE_API_URL}/api/v1/setting`;

    const response = await fetch(skylineUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.keystone_token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), { status: response.status });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Update Setting API error:", err);
    return new NextResponse(JSON.stringify({ message: "Update Setting API failed" }), { status: 500 });
  }
}
