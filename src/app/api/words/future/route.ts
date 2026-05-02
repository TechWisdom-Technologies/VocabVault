import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";

const DAILY_LIMIT = 5;

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const todayKey = getToday();
  const startOfDay = new Date(`${todayKey}T00:00:00Z`);
  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

  try {
    // 1. Get today's set if it exists
    const dailySet = await prisma.dailyWordSet.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay,
          lt: startOfNextDay,
        },
      },
    });

    const startedRows = await prisma.wordProgress.findMany({
      where: { userId: user.id },
      select: { wordId: true },
    });
    const startedWordIds = startedRows.map((r) => r.wordId);

    // 2. Fetch all words the user has started + some future words
    // We want 8 days total (Today + 7 days)
    // 8 days * 5 words = 40 words
    const futureWords = await prisma.word.findMany({
      where: {
        OR: [
          { id: { in: startedWordIds } },
          { id: { notIn: startedWordIds } }
        ]
      },
      orderBy: { orderIndex: "asc" },
      // We want to skip words the user HASN'T started yet, but include those they HAVE started
      // Actually, let's just find the first word NOT started and take 40 words from there,
      // and ALSO include today's words.
    });

    // Let's rethink. We want "Today" and then "Tomorrow" ... "Day 7".
    // Today's words are in the dailySet or the first 5 unstarted words.
    
    const allWords = await prisma.word.findMany({
      orderBy: { orderIndex: "asc" },
    });

    const progress = await prisma.wordProgress.findMany({
      where: { userId: user.id },
    });

    const progressMap = new Map();
    progress.forEach(p => progressMap.set(p.wordId, p));

    // Determine where the user is
    // Find words that are either in today's set OR are the next available
    let currentWordIndex = 0;
    if (startedWordIds.length > 0) {
      // Find the max orderIndex of started words
      const lastStartedWord = await prisma.word.findFirst({
        where: { id: { in: startedWordIds } },
        orderBy: { orderIndex: "desc" },
      });
      if (lastStartedWord) {
        currentWordIndex = lastStartedWord.orderIndex;
      }
    }

    // Today's words are either the ones in dailySet or the next 5 after the "last completed" block?
    // Actually, let's just group the entire curriculum into "Days" of 5 words each.
    
    const days = [];
    for (let i = 0; i < 8; i++) {
      const dayWords = allWords.slice(i * DAILY_LIMIT, (i + 1) * DAILY_LIMIT);
      if (dayWords.length === 0) break;
      
      days.push({
        dayIndex: i,
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `Day ${i + 1}`,
        words: dayWords.map(w => ({
          ...w,
          status: progressMap.get(w.id)?.status || "LOCKED",
          progress: progressMap.get(w.id) || null,
        }))
      });
    }

    // Adjusting "Today" logic: 
    // If the user is on day 50 of their journey, we don't want to show day 1.
    // We want the "Day" that contains the current uncompleted words.
    
    // Find the first day that has an uncompleted word
    let activeDayIndex = 0;
    for (let i = 0; i < Math.ceil(allWords.length / DAILY_LIMIT); i++) {
      const slice = allWords.slice(i * DAILY_LIMIT, (i + 1) * DAILY_LIMIT);
      const hasUncompleted = slice.some(w => !progressMap.has(w.id) || progressMap.get(w.id).status !== "COMPLETED");
      if (hasUncompleted) {
        activeDayIndex = i;
        break;
      }
    }

    const resultDays = [];
    for (let i = 0; i < 8; i++) {
      const targetDayIndex = activeDayIndex + i;
      const slice = allWords.slice(targetDayIndex * DAILY_LIMIT, (targetDayIndex + 1) * DAILY_LIMIT);
      if (slice.length === 0) break;

      resultDays.push({
        dayIndex: i,
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : i === 2 ? "Day After Tomorrow" : `Day ${i + 1}`,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        words: slice.map((w, wordIdx) => {
          const globalIdx = targetDayIndex * DAILY_LIMIT + wordIdx;
          let status = progressMap.get(w.id)?.status || "LOCKED";
          
          // Strict sequential check:
          // A word can only be ACTIVE if it's the very first word in the curriculum
          // OR if the word immediately before it is COMPLETED.
          if (globalIdx > 0) {
            const prevWord = allWords[globalIdx - 1];
            const prevStatus = progressMap.get(prevWord.id)?.status;
            if (prevStatus !== "COMPLETED") {
              status = "LOCKED";
            }
          }

          return {
            id: w.id,
            word: w.word,
            status,
            currentStage: progressMap.get(w.id)?.currentStage || 1,
          };
        })
      });
    }

    return NextResponse.json({ days: resultDays });
  } catch (error) {
    console.error("Error fetching future words:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
