import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const { wordId } = await req.json();

    if (!wordId) {
      return NextResponse.json({ error: "wordId is required" }, { status: 400 });
    }

    // Find existing progress
    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId },
    });

    if (!progress) {
      return NextResponse.json({ error: "No progress found for this word" }, { status: 404 });
    }

    // Delete all stage scores for this progress, then reset the progress record
    await prisma.$transaction([
      prisma.stageScore.deleteMany({
        where: { wordProgressId: progress.id },
      }),
      prisma.wordProgress.update({
        where: { id: progress.id },
        data: {
          status: "IN_PROGRESS",
          currentStage: 1,
          totalScore: 0,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}
