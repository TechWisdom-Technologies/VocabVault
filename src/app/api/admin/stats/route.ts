import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateAdminRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const now = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(startOfMonth.getDate() - 30);

    // Users
    const totalUsers = await prisma.user.count();
    const proUsers = await prisma.user.count({ where: { plan: "PRO" } });
    const active7Days = await prisma.user.count({ where: { updatedAt: { gte: startOfWeek } } });
    const active30Days = await prisma.user.count({ where: { updatedAt: { gte: startOfMonth } } });
    const signupsToday = await prisma.user.count({ where: { createdAt: { gte: startOfDay } } });

    const signupsWeek = await prisma.user.count({ where: { createdAt: { gte: startOfWeek } } });
    const signupsMonth = await prisma.user.count({ where: { createdAt: { gte: startOfMonth } } });

    // Progress
    const totalWordsLearnedAgg = await prisma.user.aggregate({ _sum: { wordsLearned: true } });
    const totalWordsLearned = totalWordsLearnedAgg._sum.wordsLearned || 0;

    const totalStagesCompleted = await prisma.stageScore.count({ where: { passed: true } });

    // Revenue estimate based on Pro users * configured price
    const revenue = proUsers * 499; // 499 BDT per pro user

    // Locked accounts
    const lockedAccounts = await prisma.user.count({ where: { isLocked: true } });

    // Total active sessions
    const activeSessions = await prisma.deviceSession.count();

    return NextResponse.json({
      totalUsers,
      proUsers,
      active7Days,
      active30Days,
      signupsToday,
      signupsWeek,
      signupsMonth,
      totalWordsLearned,
      totalStagesCompleted,
      revenue,
      lockedAccounts,
      activeSessions,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
