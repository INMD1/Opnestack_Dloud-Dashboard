import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSkylineClient } from "@/lib/skyline";

export async function GET(req: NextRequest) {
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

  const { skyline_url, skyline_admin_token } = await getSkylineSettings();

  try {
    const res = await fetch(`${skyline_url}/api/v1/keypairs`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": skyline_admin_token || "",
      },
      body: JSON.stringify({ name }),
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

async function getSkylineSettings() {
  await connectMongoDB();
  const skylineUrlSetting = await Setting.findOne({ name: "SKYLINE_URL" });
  const skylineAdminTokenSetting = await Setting.findOne({
    name: "SKYLINE_ADMIN_TOKEN",
  });

  return {
    skyline_url: skylineUrlSetting ? skylineUrlSetting.value : "",
    skyline_admin_token: skylineAdminTokenSetting
      ? skylineAdminTokenSetting.value
      : "",
  };
}