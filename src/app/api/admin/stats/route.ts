import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateAdminRequest(req);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - days);

    const prevPeriodStart = new Date();
    prevPeriodStart.setDate(now.getDate() - (days * 2));

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // --- Current Period Metrics ---
    const totalUsers = await prisma.user.count();
    const proUsers = await prisma.user.count({ where: { plan: "PRO" } });
    const activeUsers = await prisma.user.count({ where: { updatedAt: { gte: periodStart } } });
    const signupsToday = await prisma.user.count({ where: { createdAt: { gte: startOfDay } } });
    
    // Words learned (sum of progress records started in period)
    const wordsLearnedResult = await prisma.user.aggregate({ _sum: { wordsLearned: true } });
    const totalWordsLearned = wordsLearnedResult._sum.wordsLearned || 0;

    // Revenue (Estimated)
    const revenue = proUsers * 499;

    // --- Growth Calculations ---
    const usersInPrevPeriod = await prisma.user.count({ 
      where: { createdAt: { gte: prevPeriodStart, lt: periodStart } } 
    });
    const usersInCurrPeriod = await prisma.user.count({ 
      where: { createdAt: { gte: periodStart } } 
    });
    const userGrowth = usersInPrevPeriod > 0 
      ? Math.round(((usersInCurrPeriod - usersInPrevPeriod) / usersInPrevPeriod) * 100) 
      : 0;

    const wordsInPrevPeriod = await prisma.wordProgress.count({
      where: { startedAt: { gte: prevPeriodStart, lt: periodStart } }
    });
    const wordsInCurrPeriod = await prisma.wordProgress.count({
      where: { startedAt: { gte: periodStart } }
    });
    const wordGrowth = wordsInPrevPeriod > 0
      ? Math.round(((wordsInCurrPeriod - wordsInPrevPeriod) / wordsInPrevPeriod) * 100)
      : 0;

    // --- Recent Activity Feed ---
    const recentActivity = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      totalUsers,
      proUsers,
      activeUsers,
      signupsToday,
      totalWordsLearned,
      revenue,
      growth: {
        users: userGrowth,
        words: wordGrowth,
        platform: Math.round((userGrowth + wordGrowth) / 2) // Aggregated growth estimate
      },
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        type: log.actionType,
        message: log.actionType.replace(/_/g, ' ').toLowerCase(),
        user: log.user,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
