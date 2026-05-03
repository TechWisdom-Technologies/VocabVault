import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const words = await prisma.word.findMany({
      select: {
        id: true,
        word: true,
        partOfSpeech: true,
        orderIndex: true,
        createdAt: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    
    // Calculate next orderIndex if not provided
    let nextIdx = body.orderIndex;
    if (!nextIdx) {
      const lastWord = await prisma.word.findFirst({
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      nextIdx = lastWord ? lastWord.orderIndex + 1 : 1;
    }
    
    const { recall1Questions, recall2Pairs, ...rest } = body;

    const newWord = await prisma.word.create({
      data: {
        word: rest.word,
        phonetic: rest.phonetic,
        partOfSpeech: rest.partOfSpeech,
        definition: rest.definition,
        tenseForms: rest.tenseForms || [],
        pronunciationAudioUrl: rest.pronunciationAudioUrl,
        definitionAudioUrl: rest.definitionAudioUrl,
        synonyms: rest.synonyms || [],
        antonyms: rest.antonyms || [],
        sentences: rest.sentences || [],
        articles: rest.articles || [],
        paragraph: rest.paragraph || "",
        audioClipUrls: rest.audioClipUrls || [],
        correctAudioCounts: rest.correctAudioCounts || [],
        paragraphTargetCount: parseInt(rest.paragraphTargetCount) || 0,
        paragraphSynonymCount: parseInt(rest.paragraphSynonymCount) || 0,
        paragraphAntonymCount: parseInt(rest.paragraphAntonymCount) || 0,
        orderIndex: parseInt(nextIdx) || 1,
      },
    });

    // Manually update the new JSON fields using raw SQL to ensure they save even if the client is stale
    if (recall1Questions !== undefined || recall2Pairs !== undefined) {
      await prisma.$executeRawUnsafe(
        `UPDATE "words" SET "recall_1_questions" = $1, "recall_2_pairs" = $2 WHERE "id" = $3`,
        JSON.stringify(recall1Questions || []),
        JSON.stringify(recall2Pairs || []),
        newWord.id
      );
    }

    return NextResponse.json({ word: newWord });
  } catch (error) {
    const err = error as any;
    console.error("Error creating word:", err);
    return NextResponse.json({ 
      error: err.message || "Failed to create word",
      details: err.code === 'P2002' ? 'Unique constraint failed on ' + err.meta?.target : undefined
    }, { status: 500 });
  }
}
