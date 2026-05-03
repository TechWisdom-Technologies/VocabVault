import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const { wordId } = await req.json();

    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId },
      include: { stageScores: true },
    });

    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 });
    }

    const bestScores = new Map<number, number>();
    progress.stageScores.forEach((s) => {
      const currentBest = bestScores.get(s.stageNumber) || 0;
      if (s.score > currentBest) {
        bestScores.set(s.stageNumber, s.score);
      }
    });

    let totalScore = 0;
    bestScores.forEach((s) => (totalScore += s));

    // Check if every stage 1-10 has best score >= 8
    const flaggedStages: number[] = [];
    for (let i = 1; i <= 10; i++) {
      if ((bestScores.get(i) || 0) < 8) flaggedStages.push(i);
    }

    if (totalScore < 80 || flaggedStages.length > 0) {
      return NextResponse.json({ 
        error: "Insufficient mastery", 
        message: totalScore < 80 ? "Total score must be at least 80" : "All stages must have at least 8/10 score",
        flaggedStages 
      }, { status: 400 });
    }

    await prisma.wordProgress.update({
      where: { id: progress.id },
      data: {
        status: "COMPLETED",
        totalScore,
        completedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "WORD_COMPLETED",
        wordId,
        stageNumber: 10,
        score: totalScore,
        metadata: { totalScore, completedVia: "summary" },
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        wordsLearned: { increment: 1 },
        totalScore: { increment: totalScore },
      },
    });

    // --- Daily Streak Rewards ---
    const streakMilestones = [7, 14, 30, 60, 100];
    if (streakMilestones.includes(updatedUser.currentStreak)) {
      // Check if already claimed
      const existingReward = await prisma.streakReward.findFirst({
        where: { userId: user.id, milestone: updatedUser.currentStreak }
      });
      if (!existingReward) {
        await prisma.streakReward.create({
          data: {
            userId: user.id,
            milestone: updatedUser.currentStreak,
            rewardType: "XP_BOOST" // default reward for now
          }
        });
      }
    }

    // --- Achievement Badges ---
    // Check FIRST_WORD
    if (updatedUser.wordsLearned === 1) {
      await prisma.achievement.upsert({
        where: { userId_type: { userId: user.id, type: "FIRST_WORD" } },
        create: { userId: user.id, type: "FIRST_WORD" },
        update: {}
      });
    }

    // Check TEN_WORDS
    if (updatedUser.wordsLearned === 10) {
      await prisma.achievement.upsert({
        where: { userId_type: { userId: user.id, type: "TEN_WORDS" } },
        create: { userId: user.id, type: "TEN_WORDS" },
        update: {}
      });
    }

    // Check PERFECT_STAGE (Score >= 100 on the word)
    if (totalScore >= 100) {
      await prisma.achievement.upsert({
        where: { userId_type: { userId: user.id, type: "PERFECT_SCORE" } },
        create: { userId: user.id, type: "PERFECT_SCORE" },
        update: {}
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing word:", error);
    return NextResponse.json(
      { error: "Failed to complete word" },
      { status: 500 }
    );
  }
}
