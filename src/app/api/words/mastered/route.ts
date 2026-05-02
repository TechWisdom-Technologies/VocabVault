import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    const progressList = await prisma.wordProgress.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: {
        word: {
          select: {
            id: true,
            word: true,
            phonetic: true,
            partOfSpeech: true,
            definition: true,
            synonyms: true,
            pronunciationAudioUrl: true,
            audioClipUrls: true,
          },
        },
      },
    });

    const words = progressList.map(p => ({
      ...p.word,
      completedAt: p.completedAt,
      totalScore: p.totalScore,
    }));

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Error fetching mastered words:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastered words" },
      { status: 500 }
    );
  }
}
