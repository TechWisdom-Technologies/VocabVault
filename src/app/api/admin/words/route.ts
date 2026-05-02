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
    
    // Calculate next orderIndex
    const lastWord = await prisma.word.findFirst({
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    
    const nextOrderIndex = lastWord ? lastWord.orderIndex + 1 : 1;

    const newWord = await prisma.word.create({
      data: {
        word: body.word,
        phonetic: body.phonetic,
        partOfSpeech: body.partOfSpeech,
        definition: body.definition,
        tenseForms: body.tenseForms || [],
        pronunciationAudioUrl: body.pronunciationAudioUrl,
        definitionAudioUrl: body.definitionAudioUrl,
        synonyms: body.synonyms || [],
        antonyms: body.antonyms || [],
        sentences: body.sentences || [],
        articles: body.articles || [],
        paragraph: body.paragraph || "",
        audioClipUrls: body.audioClipUrls || [],
        correctAudioCounts: body.correctAudioCounts || [],
        paragraphTargetCount: body.paragraphTargetCount || 0,
        paragraphSynonymCount: body.paragraphSynonymCount || 0,
        paragraphAntonymCount: body.paragraphAntonymCount || 0,
        orderIndex: nextOrderIndex,
      },
    });

    return NextResponse.json({ word: newWord });
  } catch (error) {
    console.error("Error creating word:", error);
    return NextResponse.json({ error: "Failed to create word" }, { status: 500 });
  }
}
