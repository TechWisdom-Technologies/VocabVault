import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    // We only fetch notifications created in the last 20 seconds for the toast
    // OR we fetch all unread notifications for the bell icon badge.
    const url = new URL(req.url);
    const recentOnly = url.searchParams.get("recent") === "true";

    const whereClause: any = {
      userId: user.id,
      read: false,
    };

    if (recentOnly) {
      const twentySecondsAgo = new Date(Date.now() - 20000);
      whereClause.createdAt = { gte: twentySecondsAgo };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
