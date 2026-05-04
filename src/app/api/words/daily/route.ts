import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
});

const DAILY_LIMIT = 5;
const FREE_PLAN_LIMIT = 25;

interface CachedDailyResponse {
  data: unknown;
  timestamp: number;
}

const DAILY_WORDS_RESPONSE_CACHE = new Map<string, CachedDailyResponse>();
const DAILY_WORDS_RESPONSE_CACHE_TTL = 15_000;

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const tzOffset = Number(searchParams.get("tz")) || 0; // minutes

  const { user } = authResult;
  
  // Prioritize user's saved timezone string, fall back to query param offset
  const todayKey = getToday(user.timezone || tzOffset);
  const cacheKey = `${user.id}:${todayKey}`;

  const cached = DAILY_WORDS_RESPONSE_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DAILY_WORDS_RESPONSE_CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // startOfDay in "Local Date" but stored as midnight in that date's string
  const startOfDay = new Date(`${todayKey}T00:00:00.000Z`);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

  try {
    const dailySet = await prisma.dailyWordSet.findFirst({
      where: {
        userId: user.id,
        date: { gte: startOfDay, lt: startOfNextDay },
      },
    });

    if (dailySet) {
      const sevenDaysAgo = new Date(startOfDay);
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

      const historySets = await prisma.dailyWordSet.findMany({
        where: { userId: user.id, date: { gte: sevenDaysAgo, lte: startOfDay } },
        orderBy: { date: "desc" },
      });

      const allWordIds = Array.from(new Set(historySets.flatMap(s => s.wordIds as string[])));
      const [historyWords, historyProgress] = await Promise.all([
        prisma.word.findMany({ where: { id: { in: allWordIds } } }),
        prisma.wordProgress.findMany({ where: { userId: user.id, wordId: { in: allWordIds } } })
      ]);

      const wordMap = new Map(historyWords.map(w => [w.id, w]));
      const progressMap = new Map(historyProgress.map(p => [p.wordId, p]));

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { dayCount: true }
      });
      const currentDayCount = currentUser?.dayCount || 0;

      const days = historySets.map((s, idx) => {
        const dayNumber = currentDayCount - idx;
        const wordsForThisDay = (s.wordIds as string[])
          .map(id => wordMap.get(id))
          .filter(Boolean)
          .sort((a: any, b: any) => a.orderIndex - b.orderIndex);

        return {
          date: s.date,
          isToday: s.date.getTime() === startOfDay.getTime(),
          label: `Day ${dayNumber}`,
          words: wordsForThisDay,
          progress: (s.wordIds as string[]).map(id => progressMap.get(id)).filter(Boolean),
        };
      });

      const currentWordIds = dailySet.wordIds as string[];
      const currentWords = currentWordIds.map(id => wordMap.get(id)).filter(Boolean) as any[];
      
      // If current set is empty (e.g. words were deleted from DB), trigger a re-assignment
      if (currentWords.length === 0 && currentWordIds.length > 0) {
        console.warn(`Daily set for user ${user.id} contains only missing words. Re-assigning...`);
        // We'll fall through to the assignment logic below by not returning here
      } else {
        const responsePayload = {
          dailySet,
          words: currentWords.sort((a, b) => a.orderIndex - b.orderIndex),
          progress: currentWordIds.map(id => progressMap.get(id)).filter(Boolean),
          days,
          dayCount: currentDayCount,
          isPaywalled: false,
        };

        DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, { data: responsePayload, timestamp: Date.now() });
        return NextResponse.json(responsePayload);
      }
    }

    const totalWordsStarted = await prisma.wordProgress.count({
      where: { userId: user.id },
    });

    const wordsToAssignCount = user.plan === "FREE" 
      ? Math.min(DAILY_LIMIT, FREE_PLAN_LIMIT - totalWordsStarted)
      : DAILY_LIMIT;

    if (wordsToAssignCount <= 0 && user.plan === "FREE") {
      return NextResponse.json({ error: "Limit reached", isPaywalled: true }, { status: 403 });
    }

    const completedProgress = await prisma.wordProgress.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      select: { wordId: true }
    });
    const completedWordIds = completedProgress.map(p => p.wordId);

    let chosenWords = await prisma.word.findMany({
      where: { id: { notIn: completedWordIds } },
      orderBy: { orderIndex: "asc" },
      take: wordsToAssignCount
    });

    let usedFallback = false;
    if (chosenWords.length === 0 && wordsToAssignCount > 0) {
      usedFallback = true;
      chosenWords = await prisma.word.findMany({
        orderBy: { orderIndex: "asc" },
        take: wordsToAssignCount
      });
    }

    if (chosenWords.length === 0) {
      return NextResponse.json({ message: "Completed!", dailySet: null, words: [], progress: [] });
    }

    const newWordIds = chosenWords.map((w) => w.id);

    const transactionResult = await prisma.$transaction(async (tx) => {
      const set = await tx.dailyWordSet.create({
        data: { userId: user.id, date: startOfDay, wordIds: newWordIds },
      });

      const progressEntries = await Promise.all(
        newWordIds.map((wordId) =>
          tx.wordProgress.upsert({
            where: { userId_wordId: { userId: user.id, wordId } },
            create: { userId: user.id, wordId, date: startOfDay, status: "IN_PROGRESS", currentStage: 1 },
            update: { date: startOfDay },
          })
        )
      );

      const yesterdaySet = await tx.dailyWordSet.findFirst({
        where: { userId: user.id, date: { gte: new Date(startOfDay.getTime() - 86400000), lt: startOfDay } },
      });

      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { dayCount: true, currentStreak: true, longestStreak: true },
      });

      const newDayCount = (currentUser?.dayCount || 0) + 1;
      const newStreak = yesterdaySet ? (currentUser?.currentStreak || 0) + 1 : 1;

      await tx.user.update({
        where: { id: user.id },
        data: {
          dayCount: newDayCount,
          currentStreak: newStreak,
          longestStreak: Math.max(currentUser?.longestStreak || 0, newStreak),
        },
      });

      return { set, progressEntries, dayCount: newDayCount };
    });

    const finalSets = await prisma.dailyWordSet.findMany({
      where: { userId: user.id, date: { gte: new Date(startOfDay.getTime() - 6 * 86400000), lte: startOfDay } },
      orderBy: { date: "desc" },
    });

    const finalWordIds = Array.from(new Set(finalSets.flatMap(s => s.wordIds as string[])));
    const [finalWords, finalProgress] = await Promise.all([
      prisma.word.findMany({ where: { id: { in: finalWordIds } } }),
      prisma.wordProgress.findMany({ where: { userId: user.id, wordId: { in: finalWordIds } } })
    ]);

    const finalWordMap = new Map(finalWords.map(w => [w.id, w]));
    const finalProgMap = new Map(finalProgress.map(p => [p.wordId, p]));

    const historyDays = finalSets.map((s, idx) => ({
      date: s.date,
      isToday: s.date.getTime() === startOfDay.getTime(),
      label: `Day ${transactionResult.dayCount - idx}`,
      words: (s.wordIds as string[]).map(id => finalWordMap.get(id)).filter(Boolean).sort((a: any, b: any) => a.orderIndex - b.orderIndex),
      progress: (s.wordIds as string[]).map(id => finalProgMap.get(id)).filter(Boolean),
    }));

    const responsePayload = {
      dailySet: transactionResult.set,
      words: chosenWords.sort((a, b) => a.orderIndex - b.orderIndex),
      progress: transactionResult.progressEntries,
      days: historyDays,
      dayCount: transactionResult.dayCount,
      isPaywalled: false,
      debug: { usedFallback },
    };

    DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, { data: responsePayload, timestamp: Date.now() });
    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}