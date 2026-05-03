import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CachedActivityResponse {
  activities: any[];
  timestamp: number;
}

const ACTIVITY_RESPONSE_CACHE = new Map<string, CachedActivityResponse>();
const ACTIVITY_RESPONSE_CACHE_TTL = 15_000;

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  const cached = ACTIVITY_RESPONSE_CACHE.get(user.id);
  if (cached && Date.now() - cached.timestamp < ACTIVITY_RESPONSE_CACHE_TTL) {
    return NextResponse.json({ activities: cached.activities });
  }

  if (cached) {
    ACTIVITY_RESPONSE_CACHE.delete(user.id);
  }

  try {
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const wordIds = recentLogs.map((entry) => entry.wordId).filter((wordId): wordId is string => Boolean(wordId));
    const words = wordIds.length > 0
      ? await prisma.word.findMany({
          where: { id: { in: wordIds } },
          select: { id: true, word: true },
        })
      : [];
    const wordMap = new Map(words.map((word) => [word.id, word.word]));

    const activities = recentLogs.map((entry) => ({
      id: entry.id,
      type: entry.actionType,
      wordId: entry.wordId,
      word: entry.wordId ? wordMap.get(entry.wordId) || entry.wordId : "",
      stageIndex: entry.stageNumber || 0,
      score: entry.score || 0,
      timestamp: entry.createdAt,
      metadata: entry.metadata,
    }));

    if (activities.length === 0) {
      const recentScores = await prisma.stageScore.findMany({
        where: {
          wordProgress: {
            userId: user.id,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          wordProgress: {
            include: {
              word: true,
            },
          },
        },
      });

      return NextResponse.json({
        activities: recentScores.map((score) => ({
          id: score.id,
          type: "STAGE_COMPLETED",
          wordId: score.wordProgress.word.id,
          word: score.wordProgress.word.word,
          stageIndex: score.stageNumber,
          score: score.score,
          timestamp: score.createdAt,
        })),
      });
    }

    ACTIVITY_RESPONSE_CACHE.set(user.id, {
      activities,
      timestamp: Date.now(),
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
