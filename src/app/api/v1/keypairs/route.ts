import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSkylineClient } from "@/lib/skyline";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.GET("/api/v1/keypairs");

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return new NextResponse(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error("List Keypairs API error:", err);
        return new NextResponse(JSON.stringify({ message: "List Keypairs API failed" }), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.keystone_token) {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const skylineClient = getSkylineClient(session.keystone_token);
        const { data, error } = await skylineClient.POST("/api/v1/keypairs", { body });

        if (error) {
            return new NextResponse(JSON.stringify(error), { status: 500 });
        }

        return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating keypair:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { message: "Keypair name is required" },
      { status: 400 }
    );
  }

  
  try {
    const res = await fetch(`${process.env.SKYLINE_API_URL}/api/v1/keypairs/${name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": session.keystone_token || "",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: `Failed to delete keypair ${name}`, error: errorData },
        { status: res.status }
      );
    }

    return NextResponse.json({ message: `Keypair ${name} deleted successfully` });
  } catch (error) {
    console.error("Error deleting keypair:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

