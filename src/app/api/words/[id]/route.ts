import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToday } from "@/lib/utils";

// ─── Word Data Cache ─────────────────────────────────────
// Word content (definitions, sentences, articles, etc.) NEVER changes during a session.
// Cache it in-memory so we only hit Postgres once per word per server restart.
const WORD_CACHE = new Map<string, { data: any; timestamp: number }>();
const WORD_CACHE_TTL = 600_000; // 10 minutes

/**
 * GET /api/words/[id]
 * Fetch the full word data and the user's progress for it.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const resolvedParams = await params;
    const wordId = resolvedParams.id;
    const { user } = authResult;

    // Check word cache first
    let word: any = null;
    const cached = WORD_CACHE.get(wordId);
    if (cached && Date.now() - cached.timestamp < WORD_CACHE_TTL) {
      word = cached.data;
    } else {
      word = await prisma.word.findUnique({
        where: { id: wordId },
      });
      if (word) {
        WORD_CACHE.set(wordId, { data: word, timestamp: Date.now() });
      }
    }

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Ensure user has access to this word today
    const progress = await prisma.wordProgress.findFirst({
      where: {
        userId: user.id,
        wordId: wordId,
      },
      select: {
        id: true,
        status: true,
        currentStage: true,
        totalScore: true,
        flaggedStages: true,
      },
    });

    if (!progress && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Word is not active in your current curriculum." },
        { status: 403 }
      );
    }

    // ─── Strict Sequential Logic ───
    // Prevent direct URL access to words beyond the user's current progress
    const effectiveMaxIndex = Math.max(1, user.maxUnlockedIndex);
    if (word.orderIndex > effectiveMaxIndex && user.role !== "ADMIN") {
      // Check if the user has already completed this word (e.g. they are revisiting it)
      // If word.orderIndex > effectiveMaxIndex, it means it's a "future" word for them.
      // But we should allow them to see it if they somehow have progress COMPLETED (unlikely but safe)
      if (!progress || progress.status !== "COMPLETED") {
        return NextResponse.json(
          { 
            error: "Curriculum Sequence Violation", 
            message: "This word is currently locked. Complete your current words to unlock it." 
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ word, progress });
  } catch (error) {
    console.error("Error fetching word:", error);
    return NextResponse.json(
      { error: "Failed to fetch word" },
      { status: 500 }
    );
  }
}
