import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.json();
    const { data } = formData; // Expected format: Array of word objects

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array." }, { status: 400 });
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Calculate starting orderIndex
    const lastWord = await prisma.word.findFirst({
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    let currentOrderIndex = lastWord ? lastWord.orderIndex + 1 : 1;

    for (const item of data) {
      try {
        const { word, recall1Questions, recall2Pairs, ...rest } = item;
        
        if (!word) continue;

        // Check if word exists
        const existing = await prisma.word.findUnique({
          where: { word },
        });

        let savedWord;
        if (existing) {
          // Update
          savedWord = await prisma.word.update({
            where: { id: existing.id },
            data: {
              phonetic: rest.phonetic || existing.phonetic,
              partOfSpeech: rest.partOfSpeech || existing.partOfSpeech,
              definition: rest.definition || existing.definition,
              tenseForms: rest.tenseForms || existing.tenseForms,
              pronunciationAudioUrl: rest.pronunciationAudioUrl || existing.pronunciationAudioUrl,
              definitionAudioUrl: rest.definitionAudioUrl || existing.definitionAudioUrl,
              synonyms: rest.synonyms || existing.synonyms,
              antonyms: rest.antonyms || existing.antonyms,
              sentences: rest.sentences || existing.sentences,
              articles: rest.articles || existing.articles,
              paragraph: rest.paragraph || existing.paragraph,
              audioClipUrls: rest.audioClipUrls || existing.audioClipUrls,
              correctAudioCounts: rest.correctAudioCounts || existing.correctAudioCounts,
              paragraphTargetCount: parseInt(rest.paragraphTargetCount) || existing.paragraphTargetCount,
              paragraphSynonymCount: parseInt(rest.paragraphSynonymCount) || existing.paragraphSynonymCount,
              paragraphAntonymCount: parseInt(rest.paragraphAntonymCount) || existing.paragraphAntonymCount,
            },
          });
          results.updated++;
        } else {
          // Create
          savedWord = await prisma.word.create({
            data: {
              word,
              phonetic: rest.phonetic || "",
              partOfSpeech: rest.partOfSpeech || "",
              definition: rest.definition || "",
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
              orderIndex: currentOrderIndex++,
            },
          });
          results.created++;
        }

        // Handle JSON fields via raw SQL bypass (stale client protection)
        if (recall1Questions || recall2Pairs) {
          await prisma.$executeRawUnsafe(
            `UPDATE "words" SET "recall_1_questions" = $1::jsonb, "recall_2_pairs" = $2::jsonb WHERE "id" = $3`,
            JSON.stringify(recall1Questions || []),
            JSON.stringify(recall2Pairs || []),
            savedWord.id
          );
        }

      } catch (err: any) {
        results.failed++;
        results.errors.push(`${item.word || 'Unknown'}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk import" }, { status: 500 });
  }
}
