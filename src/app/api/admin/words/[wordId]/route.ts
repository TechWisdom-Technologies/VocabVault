import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ wordId: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { wordId } = await context.params;
    const word = await prisma.word.findUnique({
      where: { id: wordId },
    });

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json({ word });
  } catch (error) {
    console.error("Error fetching word:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ wordId: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { wordId } = await context.params;
    const body = await req.json();
    
    // Separate new fields to handle them via raw SQL if needed (bypassing client validation issues in dev)
    const { recall1Questions, recall2Pairs, ...rest } = body;

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: {
        word: rest.word,
        phonetic: rest.phonetic,
        partOfSpeech: rest.partOfSpeech,
        definition: rest.definition,
        tenseForms: rest.tenseForms,
        pronunciationAudioUrl: rest.pronunciationAudioUrl,
        definitionAudioUrl: rest.definitionAudioUrl,
        synonyms: rest.synonyms,
        antonyms: rest.antonyms,
        sentences: rest.sentences,
        articles: rest.articles,
        paragraph: rest.paragraph,
        audioClipUrls: rest.audioClipUrls,
        correctAudioCounts: rest.correctAudioCounts,
        paragraphTargetCount: parseInt(rest.paragraphTargetCount) || 0,
        paragraphSynonymCount: parseInt(rest.paragraphSynonymCount) || 0,
        paragraphAntonymCount: parseInt(rest.paragraphAntonymCount) || 0,
        orderIndex: parseInt(rest.orderIndex) || 0,
      },
    });

    // Manually update the new JSON fields using raw SQL to ensure they save even if the client is stale
    if (recall1Questions !== undefined || recall2Pairs !== undefined) {
      await prisma.$executeRawUnsafe(
        `UPDATE "words" SET "recall_1_questions" = $1::jsonb, "recall_2_pairs" = $2::jsonb WHERE "id" = $3`,
        JSON.stringify(recall1Questions || []),
        JSON.stringify(recall2Pairs || []),
        wordId
      );
    }

    return NextResponse.json({ word: updatedWord });
  } catch (error: any) {
    console.error("Error updating word:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update word",
      details: error.code === 'P2002' ? 'Unique constraint failed on ' + error.meta?.target : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ wordId: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { wordId } = await context.params;
    await prisma.word.delete({
      where: { id: wordId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting word:", error);
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
