import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        totalScore: true,
        wordsLearned: true,
        isLocked: true,
        lockReason: true,
        dob: true,
        nationality: true,
        profession: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    // Fetch logs for these users
    const userIds = users.map(u => u.id);
    const logs = await prisma.adminLog.findMany({
      where: {
        targetType: "USER",
        targetId: { in: userIds },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Attach logs to users
    const usersWithLogs = users.map(user => ({
      ...user,
      logs: logs.filter(l => l.targetId === user.id),
    }));

    return NextResponse.json({ users: usersWithLogs });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
