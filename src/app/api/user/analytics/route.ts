import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    // 1. Fetch all stage scores for this user
    const stageScores = await prisma.stageScore.findMany({
      where: {
        wordProgress: {
          userId: user.id
        }
      },
      select: {
        stageNumber: true,
        score: true,
        timeSpentSeconds: true
      }
    });

    // 2. Aggregate data per stage (1-10)
    const stageStats = Array.from({ length: 10 }, (_, i) => ({
      stage: i + 1,
      avgScore: 0,
      avgTime: 0,
      count: 0
    }));

    stageScores.forEach(s => {
      const stat = stageStats[s.stageNumber - 1];
      if (stat) {
        stat.avgScore += s.score;
        stat.avgTime += s.timeSpentSeconds;
        stat.count += 1;
      }
    });

    // 3. Finalize averages
    const analytics = stageStats.map(s => ({
      stage: s.stage,
      avgScore: s.count > 0 ? parseFloat((s.avgScore / s.count).toFixed(1)) : 0,
      avgTime: s.count > 0 ? Math.round(s.avgTime / s.count) : 0
    }));

    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
