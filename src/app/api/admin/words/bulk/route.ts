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
        // Normalize keys: support both snake_case and camelCase
        const word = item.word || item.Word;
        if (!word) continue;

        const val = (camel: string, snake: string) => item[camel] !== undefined ? item[camel] : item[snake];

        // Helper to parse JSON or split strings
        const parseArr = (camel: string, snake: string) => {
          const raw = val(camel, snake);
          if (!raw) return [];
          if (Array.isArray(raw)) return raw;
          if (typeof raw === "string") {
            try {
              if (raw.startsWith("[") || raw.startsWith("{")) return JSON.parse(raw);
              return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
            } catch (e) {
              return [raw];
            }
          }
          return [raw];
        };

        const phonetic = val("phonetic", "phonetic") || "";
        const partOfSpeech = val("partOfSpeech", "part_of_speech") || "";
        const definition = val("definition", "definition") || "";
        const tenseForms = parseArr("tenseForms", "tense_forms");
        const synonyms = parseArr("synonyms", "synonyms");
        const antonyms = parseArr("antonyms", "antonyms");
        const sentences = parseArr("sentences", "sentences");
        const articles = parseArr("articles", "articles");
        const paragraph = val("paragraph", "paragraph") || "";
        const audioClipUrls = parseArr("audioClipUrls", "audio_clip_urls");
        const correctAudioCounts = parseArr("correctAudioCounts", "correct_audio_counts");
        
        const pronunciationAudioUrl = val("pronunciationAudioUrl", "pronunciation_audio_url");
        const definitionAudioUrl = val("definitionAudioUrl", "definition_audio_url");
        
        const paragraphTargetCount = parseInt(val("paragraphTargetCount", "paragraph_target_count")) || 0;
        const paragraphSynonymCount = parseInt(val("paragraphSynonymCount", "paragraph_synonym_count")) || 0;
        const paragraphAntonymCount = parseInt(val("paragraphAntonymCount", "paragraph_antonym_count")) || 0;

        const recall1Questions = parseArr("recall1Questions", "recall_1_questions");
        const recall2Pairs = parseArr("recall2Pairs", "recall_2_pairs");

        // Check if word exists
        const existing = await prisma.word.findUnique({
          where: { word },
        });

        let savedWord;
        const wordData = {
          phonetic,
          partOfSpeech,
          definition,
          tenseForms,
          pronunciationAudioUrl,
          definitionAudioUrl,
          synonyms,
          antonyms,
          sentences,
          articles,
          paragraph,
          audioClipUrls,
          correctAudioCounts,
          paragraphTargetCount,
          paragraphSynonymCount,
          paragraphAntonymCount,
        };

        if (existing) {
          savedWord = await prisma.word.update({
            where: { id: existing.id },
            data: wordData,
          });
          results.updated++;
        } else {
          savedWord = await prisma.word.create({
            data: {
              word,
              ...wordData,
              orderIndex: currentOrderIndex++,
            },
          });
          results.created++;
        }

        // Handle JSON fields via raw SQL bypass (stale client protection)
        if (recall1Questions.length > 0 || recall2Pairs.length > 0) {
          await prisma.$executeRawUnsafe(
            `UPDATE "words" SET "recall_1_questions" = $1::jsonb, "recall_2_pairs" = $2::jsonb WHERE "id" = $3`,
            JSON.stringify(recall1Questions),
            JSON.stringify(recall2Pairs),
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
