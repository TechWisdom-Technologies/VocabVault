import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";

const DAILY_LIMIT = 5;

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const FREE_PLAN_LIMIT = 25;

  try {
    // 1. Fetch ALL words and current progress
    const [allWords, userProgress, dailySet] = await Promise.all([
      prisma.word.findMany({
        orderBy: { orderIndex: "asc" },
        select: { id: true, word: true, orderIndex: true }
      }),
      prisma.wordProgress.findMany({
        where: { userId: user.id },
        select: { wordId: true, status: true, currentStage: true }
      }),
      prisma.dailyWordSet.findFirst({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        select: { wordIds: true }
      })
    ]);

    const progressMap = new Map();
    userProgress.forEach(p => progressMap.set(p.wordId, p));

    const activeWordIds = new Set(dailySet?.wordIds as string[] || []);

    // 2. Group into static sets of 5 (Group 1: 1-5, Group 2: 6-10...)
    const days = [];
    const totalGroups = Math.ceil(allWords.length / DAILY_LIMIT);

    for (let i = 0; i < totalGroups; i++) {
      const slice = allWords.slice(i * DAILY_LIMIT, (i + 1) * DAILY_LIMIT);
      if (slice.length === 0) break;

      // Plan Enforcement: If FREE, only return words up to index 25
      const isPastFreeLimit = (i * DAILY_LIMIT) >= FREE_PLAN_LIMIT;
      
      const groupWords = slice.map(w => {
        if (user.plan === "FREE" && isPastFreeLimit) {
          return {
            id: w.id,
            word: "PRO Content",
            status: "LOCKED",
            currentStage: 1,
            isLockedByPlan: true
          };
        }

        const progress = progressMap.get(w.id);
        const isActive = activeWordIds.has(w.id);
        const isCompleted = progress?.status === "COMPLETED";
        
        let status: "IN_PROGRESS" | "RETRY" | "COMPLETED" | "LOCKED" = "LOCKED";
        
        if (isCompleted) status = "COMPLETED";
        else if (progress?.status === "RETRY") status = "RETRY";
        else if (isActive) status = "IN_PROGRESS";
        else status = "LOCKED";

        return {
          id: w.id,
          word: w.word,
          status,
          currentStage: progress?.currentStage || 1,
        };
      });

      // Label as "Today" if any word in the group is active
      const isToday = groupWords.some(w => activeWordIds.has(w.id));

      days.push({
        dayIndex: i + 1,
        label: isToday ? "Today's Words" : `Word Group ${i + 1}`,
        isToday,
        words: groupWords
      });
    }

    return NextResponse.json({ 
      days,
      isPaywalled: user.plan === "FREE" && userProgress.length >= FREE_PLAN_LIMIT
    });
  } catch (error) {


    console.error("Error fetching curriculum:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
