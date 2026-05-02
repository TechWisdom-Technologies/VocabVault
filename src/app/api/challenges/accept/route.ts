import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { word: true }
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (challenge.challengedId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reset WordProgress for this word so they can learn it again for the challenge
    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId: challenge.wordId }
    });

    if (progress) {
      // Delete old scores and reset status
      await prisma.$transaction([
        prisma.stageScore.deleteMany({ where: { wordProgressId: progress.id } }),
        prisma.wordProgress.update({
          where: { id: progress.id },
          data: {
            status: "IN_PROGRESS",
            currentStage: 1,
            totalScore: 0,
            completedAt: null
          }
        })
      ]);
    } else {
      // Create new progress if it doesn't exist
      await prisma.wordProgress.create({
        data: {
          userId: user.id,
          wordId: challenge.wordId,
          date: new Date(),
          status: "IN_PROGRESS",
          currentStage: 1,
          totalScore: 0
        }
      });
    }

    // Mark challenge as ACCEPTED
    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: "ACCEPTED" }
    });

    return NextResponse.json({ 
      success: true, 
      redirectUrl: `/stage/${challenge.wordId}/1?challengeId=${challengeId}` 
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return NextResponse.json({ error: "Failed to accept challenge" }, { status: 500 });
  }
}
