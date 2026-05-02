import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const { challengedId, wordId } = await req.json();

    if (!challengedId || !wordId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (challengedId === user.id) {
      return NextResponse.json({ error: "Cannot challenge yourself" }, { status: 400 });
    }

    // Verify the challenger actually learned the word
    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId, status: "COMPLETED" },
    });

    if (!progress) {
      return NextResponse.json({ error: "You can only challenge others with words you have mastered." }, { status: 400 });
    }

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        challengerId: user.id,
        challengedId,
        wordId,
        challengerScore: progress.totalScore,
      },
      include: {
        word: true,
        challenger: true,
      }
    });

    // Create a notification for the challenged user
    await prisma.notification.create({
      data: {
        userId: challengedId,
        type: "CHALLENGE_RECEIVED",
        title: "New Challenge!",
        message: `${user.name || "Someone"} challenged you to master the word '${challenge.word.word}'!`,
        metadata: {
          challengeId: challenge.id,
          wordId: challenge.word.id,
          word: challenge.word.word,
          challengerName: user.name || "A user",
        }
      }
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to send challenge" },
      { status: 500 }
    );
  }
}
