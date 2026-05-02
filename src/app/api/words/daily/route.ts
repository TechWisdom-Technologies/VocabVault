import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
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

/**
 * GET /api/words/daily
 * Fetch or generate the daily word set for the user.
 */
export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const todayKey = getToday();
  const cacheKey = `${user.id}:${todayKey}`;

  const cached = DAILY_WORDS_RESPONSE_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DAILY_WORDS_RESPONSE_CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  if (cached) {
    DAILY_WORDS_RESPONSE_CACHE.delete(cacheKey);
  }

  if (process.env.NODE_ENV !== "development") {
    const { success } = await ratelimit.limit(`ratelimit:daily_words:${user.id}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Use explicit UTC day boundaries to avoid timezone mismatches when comparing
  // dates stored as SQL DATE. `todayKey` is 'YYYY-MM-DD' (UTC) from `getToday()`.
  const startOfDay = new Date(`${todayKey}T00:00:00Z`);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

  try {
    // 1. Check if a DailyWordSet already exists for today (UTC range)
    const dailySet = await prisma.dailyWordSet.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
      },
    });

    if (dailySet) {
      // Fetch the actual words
      const wordIds = dailySet.wordIds as string[];
      const words = await prisma.word.findMany({
        where: { id: { in: wordIds } },
        orderBy: { orderIndex: "asc" },
      });

      // Fetch progress for these words for today's UTC range
      const progress = await prisma.wordProgress.findMany({
        where: {
          userId: user.id,
          wordId: { in: wordIds },
          date: {
            gte: startOfDay,
            lt: startOfNextDay,
          },
        },
      });

      // Check if the word BEFORE the first word of this daily set is completed
      let isPrecedingWordCompleted = true;
      const minOrderIndex = Math.min(...words.map(w => w.orderIndex));
      if (minOrderIndex > 0) {
        const prevWord = await prisma.word.findFirst({
          where: { orderIndex: minOrderIndex - 1 },
          select: { id: true }
        });
        if (prevWord) {
          const prevProgress = await prisma.wordProgress.findUnique({
            where: { userId_wordId: { userId: user.id, wordId: prevWord.id } },
            select: { status: true }
          });
          isPrecedingWordCompleted = prevProgress?.status === "COMPLETED";
        }
      }

      const responsePayload = {
        dailySet,
        words,
        progress,
        isPrecedingWordCompleted,
        isPaywalled: false,
      };

      DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, {
        data: responsePayload,
        timestamp: Date.now(),
      });

      return NextResponse.json(responsePayload);
    }

    // 2. If no daily set exists, we need to generate one.
    // First, check the Free Plan cap
    const totalWordsStarted = await prisma.wordProgress.count({
      where: { userId: user.id },
    });

    if (user.plan === "FREE" && totalWordsStarted >= FREE_PLAN_LIMIT) {
      const responsePayload = {
        error: "You have reached the 25-word limit for the Free Plan.",
        isPaywalled: true,
      };

      DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, {
        data: responsePayload,
        timestamp: Date.now(),
      });

      return NextResponse.json(
        {
          ...responsePayload,
        },
        { status: 403 }
      );
    }

    // Determine how many words we can give them
    let wordsToAssignCount = DAILY_LIMIT;
    if (user.plan === "FREE") {
      const remainingFreeWords = FREE_PLAN_LIMIT - totalWordsStarted;
      wordsToAssignCount = Math.min(DAILY_LIMIT, remainingFreeWords);
    }

    // Find words the user hasn't started yet (any past progress counts as started)
    const startedRows = await prisma.wordProgress.findMany({
      where: { userId: user.id },
      select: { wordId: true },
    });
    const startedWordIds = startedRows.map((r) => r.wordId);

    // Debug: log counts to help diagnose missing daily words
    try {
      const totalWordsInDb = await prisma.word.count();
      console.info(`dailyWords: user=${user.id} totalStarted=${startedWordIds.length} totalWordsInDb=${totalWordsInDb} totalWordsStarted=${totalWordsStarted}`);
    } catch (e) {
      console.warn("dailyWords: failed to log counts", e);
    }

    const newWords = await prisma.word.findMany({
      where: {
        id: { notIn: startedWordIds },
      },
      orderBy: { orderIndex: "asc" },
      take: wordsToAssignCount,
    });

    let usedFallback = false;
    let chosenWords = newWords;

    if (newWords.length === 0) {
      const totalWordsInDb = await prisma.word.count();

      // If the user has historically started every word, allow a fallback
      // to reassign the first N words so they still get a daily set.
      if (startedWordIds.length >= totalWordsInDb) {
        usedFallback = true;
        chosenWords = await prisma.word.findMany({
          orderBy: { orderIndex: "asc" },
          take: wordsToAssignCount,
        });
      } else {
        const responsePayload = {
          message: "You have completed all available words!",
          dailySet: null,
          words: [],
          progress: [],
          // Help debug why no words: include counts
          debug: {
            totalWordsStarted,
            startedWordIdsCount: startedWordIds.length,
          },
        };

        DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, {
          data: responsePayload,
          timestamp: Date.now(),
        });

        return NextResponse.json(responsePayload);
      }
    }

    const newWordIds = chosenWords.map((w) => w.id);

    // Create the DailyWordSet and WordProgress entries in a transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      const set = await tx.dailyWordSet.create({
        data: {
          userId: user.id,
          // store the UTC start-of-day to make subsequent queries consistent
          date: startOfDay,
          wordIds: newWordIds,
        },
      });

      const progressEntries = await Promise.all(
        newWordIds.map((wordId) =>
          tx.wordProgress.upsert({
            where: { userId_wordId: { userId: user.id, wordId } },
            create: {
              userId: user.id,
              wordId,
              date: startOfDay,
              status: "IN_PROGRESS",
              currentStage: 1,
            },
            update: {
              // If an entry already exists, update it to reflect today's session
              date: startOfDay,
              status: "IN_PROGRESS",
              currentStage: 1,
            },
          })
        )
      );

      await Promise.all(
        newWordIds.map((wordId) =>
          tx.activityLog.create({
            data: {
              userId: user.id,
              actionType: "WORD_STARTED",
              wordId,
              metadata: { date: startOfDay.toISOString(), fallback: usedFallback },
            },
          })
        )
      );

      // Determine yesterday's UTC day range and check if a set existed
      const yesterdayStart = new Date(startOfDay);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);

      const yesterdaySet = await tx.dailyWordSet.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: yesterdayStart,
            lt: startOfDay,
          },
        },
      });

      // Get current user stats
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { dayCount: true, currentStreak: true, longestStreak: true },
      });

      let newStreak = 1;
      if (yesterdaySet) {
        newStreak = (currentUser?.currentStreak || 0) + 1;
      }

      const newDayCount = (currentUser?.dayCount || 0) + 1;
      const newLongestStreak = Math.max(currentUser?.longestStreak || 0, newStreak);

      await tx.user.update({
        where: { id: user.id },
        data: {
          dayCount: newDayCount,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
        },
      });

      return { set, progressEntries };
    });

    const responsePayload = {
      dailySet: transactionResult.set,
      words: chosenWords,
      progress: transactionResult.progressEntries,
      isPaywalled: false,
      debug: { usedFallback },
    };

    DAILY_WORDS_RESPONSE_CACHE.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now(),
    });

    // Log creation for debugging / retention checks
    console.info(`Created DailyWordSet for user=${user.id} date=${startOfDay.toISOString()} words=${newWordIds.length} fallback=${usedFallback}`);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching daily words:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily words" },
      { status: 500 }
    );
  }
}
