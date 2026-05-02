import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
