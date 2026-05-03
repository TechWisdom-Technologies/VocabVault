import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    // Reset only currentStage and sessionState. 
    // Do NOT delete scores or change status to preserve mastery history.
    await prisma.wordProgress.update({
      where: { id: progress.id },
      data: {
        currentStage: 1,
        sessionState: Prisma.DbNull,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}
