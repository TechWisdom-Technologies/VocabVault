import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    // Fetch all word progress for the user
    const progressList = await prisma.wordProgress.findMany({
      where: { userId: user.id },
      include: {
        word: {
          select: {
            id: true,
            word: true,
            partOfSpeech: true,
            orderIndex: true,
          },
        },
        stageScores: {
          select: {
            score: true,
            timeSpentSeconds: true,
            stageNumber: true,
            createdAt: true,
          }
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    let totalStageTime = 0;
    let totalStageScore = 0;
    let stageCount = 0;

    const dailyTimes: Record<string, number> = {};
    const stageBreakdown: Record<number, { totalScore: number; count: number }> = {};

    const hourlyHeatmap = Array.from({ length: 24 }, () => 0);

    progressList.forEach(progress => {
      progress.stageScores.forEach(score => {
        totalStageTime += score.timeSpentSeconds;
        totalStageScore += score.score;
        stageCount++;

        // Track stage breakdown
        if (!stageBreakdown[score.stageNumber]) {
          stageBreakdown[score.stageNumber] = { totalScore: 0, count: 0 };
        }
        stageBreakdown[score.stageNumber].totalScore += score.score;
        stageBreakdown[score.stageNumber].count++;

        // Heatmap
        hourlyHeatmap[score.createdAt.getHours()]++;

        const dateStr = score.createdAt.toISOString().split('T')[0];
        if (!dailyTimes[dateStr]) dailyTimes[dateStr] = 0;
        dailyTimes[dateStr] += score.timeSpentSeconds;
      });
    });

    const stageByStageAverages = Array.from({ length: 10 }, (_, i) => {
      const stage = i + 1;
      const data = stageBreakdown[stage];
      return {
        stage,
        stageName: `Stage ${stage}`,
        averageScore: data && data.count > 0 ? Number((data.totalScore / data.count).toFixed(1)) : 0
      };
    });

    const averageTimePerStage = stageCount > 0 ? Math.round(totalStageTime / stageCount) : 0;
    const averageScorePerStage = stageCount > 0 ? Number((totalStageScore / stageCount).toFixed(1)) : 0;

    const daysActive = Object.keys(dailyTimes).length;
    const averageTimePerDay = daysActive > 0
      ? Math.round(Object.values(dailyTimes).reduce((a, b) => a + b, 0) / daysActive)
      : 0;

    return NextResponse.json({
      progress: progressList,
      analytics: {
        averageTimePerStage,
        averageScorePerStage,
        averageTimePerDay,
        stageByStageAverages,
        hourlyHeatmap
      }
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    );
  }
}
