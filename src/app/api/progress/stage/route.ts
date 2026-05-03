import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const body = await req.json();
    const { wordId, stageNumber, score, timeSpentSeconds, responseData, challengeId } = body;

    if (!wordId || !stageNumber || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Validate score is on 0-10 scale
    const clampedScore = Math.max(0, Math.min(10, Math.round(score)));

    // Get current progress
    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId },
    });

    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 });
    }

    // ─── Strict Stage Sequence Check ───
    if (user.role !== "ADMIN" && stageNumber > progress.currentStage && progress.status !== "COMPLETED") {
      return NextResponse.json(
        { 
          error: "Stage Sequence Violation", 
          message: `You must complete Stage ${progress.currentStage} before proceeding to Stage ${stageNumber}.` 
        },
        { status: 403 }
      );
    }

    // Save the stage score
    await prisma.stageScore.create({
      data: {
        wordProgressId: progress.id,
        stageNumber,
        score: clampedScore,
        maxScore: 10,
        timeSpentSeconds: timeSpentSeconds || 0,
        passed: clampedScore >= 8,
        responseData: responseData || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: clampedScore >= 8 ? "STAGE_COMPLETED" : "STAGE_RETRY",
        wordId,
        stageNumber: stageNumber,
        score: clampedScore,
        metadata: {
          passed: clampedScore >= 8,
          timeSpentSeconds: timeSpentSeconds || 0,
        },
      },
    });

    // Fetch ALL stage scores for this word progress to compute totals
    const allScores = await prisma.stageScore.findMany({
      where: { wordProgressId: progress.id },
      select: {
        stageNumber: true,
        score: true,
      }
    });

    // Get best score per stage
    const bestScores = new Map<number, number>();
    allScores.forEach((s) => {
      const currentBest = bestScores.get(s.stageNumber) || 0;
      if (s.score > currentBest) {
        bestScores.set(s.stageNumber, s.score);
      }
    });

    // Calculate total score (sum of best scores across all stages, max 100)
    let totalScore = 0;
    bestScores.forEach((s) => (totalScore += s));

    // Determine next state
    // Once COMPLETED, always COMPLETED
    let newStatus: any = progress.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS";
    let newStage = progress.currentStage;
    let nextStageResponse: number | "summary" = stageNumber;

    const flaggedForRetry: number[] = [];
    for (let i = 1; i <= 10; i++) {
      const best = bestScores.get(i) || 0;
      if (best < 8) flaggedForRetry.push(i);
    }

    const hasPassedCurrent = clampedScore >= 8;

    if (stageNumber === 10) {
      if (totalScore >= 80 && flaggedForRetry.length === 0) {
        newStatus = "COMPLETED";
        newStage = 10;
        nextStageResponse = 10;
      } else {
        // If not completed yet, keep current status (which might be COMPLETED if they are just re-practicing)
        newStage = Math.max(progress.currentStage, 10);
        nextStageResponse = "summary";
      }
    } else {
      if (hasPassedCurrent) {
        if (stageNumber === progress.currentStage) {
          newStage = stageNumber + 1;
        }
        nextStageResponse = stageNumber < progress.currentStage ? "summary" : stageNumber + 1;
      } else {
        nextStageResponse = "summary";
      }
    }

    // Only update totalScore if the NEW total is better than the OLD one
    const finalTotalScore = Math.max(progress.totalScore, totalScore);

    // Update progress
    await prisma.wordProgress.update({
      where: { id: progress.id },
      data: {
        currentStage: newStage,
        status: newStatus,
        totalScore: finalTotalScore,
        sessionState: Prisma.DbNull,
        ...(newStatus === "COMPLETED" && progress.status !== "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });

    if (newStatus === "COMPLETED" && progress.status !== "COMPLETED") {
      // Update challenge if applicable
      if (challengeId) {
        await prisma.challenge.update({
          where: { id: challengeId },
          data: {
            status: "COMPLETED",
            challengedScore: totalScore,
            completedAt: new Date(),
          },
        });
      }

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "WORD_COMPLETED",
          wordId,
          stageNumber: 10,
          score: totalScore,
          metadata: {
            totalScore,
            flaggedStages: [],
          },
        },
      });
    } else if (flaggedForRetry.length > 0) {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "WORD_RETRY",
          wordId,
          stageNumber: stageNumber,
          score: totalScore,
          metadata: { flaggedStages: flaggedForRetry },
        },
      });
    }

    // If fully completed, update user stats
    if (newStatus === "COMPLETED") {
      const isFirstTime = progress.status !== "COMPLETED";
      const scoreDelta = finalTotalScore - progress.totalScore;
      
      if (isFirstTime || scoreDelta > 0) {
        const word = await prisma.word.findUnique({ where: { id: wordId } });
        const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(isFirstTime ? { wordsLearned: { increment: 1 } } : {}),
            ...(scoreDelta > 0 ? { totalScore: { increment: scoreDelta } } : {}),
            maxUnlockedIndex: Math.max(currentUser?.maxUnlockedIndex || 0, (word?.orderIndex || 0) + 1),
          },
        });
      }
    }

    // Recompute flagged stages for response if needed
    if (flaggedForRetry.length === 0 && totalScore < 80) {
      for (let i = 1; i <= 10; i++) {
        const best = bestScores.get(i) || 0;
        if (best < 8) flaggedForRetry.push(i);
      }
    }

    return NextResponse.json({
      success: true,
      stageScore: clampedScore,
      totalScore,
      nextStage: nextStageResponse,
      status: newStatus,
      flaggedStages: flaggedForRetry,
      passed: newStatus === "COMPLETED",
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
