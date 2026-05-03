import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const sessions = await prisma.deviceSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        lastActive: "desc",
      },
      take: 200,
    });

    // Get device counts for these users
    const userIds = Array.from(new Set(sessions.map(s => s.userId)));
    const counts = await prisma.deviceSession.groupBy({
      by: ['userId'],
      _count: { _all: true },
      where: { userId: { in: userIds } }
    });

    const countMap = Object.fromEntries(counts.map(c => [c.userId, c._count._all]));

    const sessionsWithCounts = sessions.map(s => ({
      ...s,
      userDeviceCount: countMap[s.userId] || 0
    }));

    return NextResponse.json({ sessions: sessionsWithCounts });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch security logs" }, { status: 500 });
  }
}
