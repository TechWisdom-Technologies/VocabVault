import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/stage/evaluate/writing
 * Evaluates free writing via Gemini.
 * Used by Stage 9 (Free Writing).
 */
export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { text, targetWord } = body;

    if (!text || !targetWord) {
      return NextResponse.json(
        { error: "Missing text or target word" },
        { status: 400 }
      );
    }

    // Count target word occurrences
    const wordRegex = new RegExp(`\\b${targetWord}\\b`, "gi");
    const matches = text.match(wordRegex);
    const wordCount = matches ? matches.length : 0;

    if (wordCount < 3) {
      return NextResponse.json({
        score: 0,
        wordCount,
        feedback: `The target word "${targetWord}" must appear at least 3 times. You used it ${wordCount} time(s). Please revise and try again.`,
        passed: false,
        blocked: true,
      });
    }

    // Fetch custom admin prompt from DB
    const adminSetting = await prisma.systemSetting.findUnique({
      where: { key: "AI_PROMPT_STAGE_9" }
    });
    const customPromptBehavior = adminSetting?.value || "You are an English teacher evaluating a student's paragraph. Ensure the target word is used correctly. Assess grammar and coherence. Provide a score between 0 and 100.";

    // Evaluate with AI
    const geminiPrompt = `${customPromptBehavior}

A learner wrote an original paragraph using the target word "${targetWord}". The word must appear at least 3 times.

Here is their text:
"${text}"

The word "${targetWord}" appears ${wordCount} time(s).

Evaluate the following:
1. Grammatical correctness of each usage of "${targetWord}"
2. Naturalness and contextual appropriateness of each usage
3. Variety across usages — are they using the word in different sentence structures, positions, and grammatical functions?
4. EXPLICITLY PENALIZE robotic repetition. If the learner just copies the same sentence pattern or uses the word in a forced/unnatural way, deduct points heavily.
5. Overall writing quality (grammar, coherence, vocabulary range)

Respond in this exact JSON format (no markdown, no code fences):
{"score": <0-10>, "feedback": "<2-3 sentences of specific, constructive feedback>", "grammarScore": <0-10>, "naturalness": <0-10>, "variety": <0-10>, "passed": <true/false>}

Score 8+ means passed. Be fair but strict. A score of 10 should be rare and reserved for genuinely excellent writing.`;

    let evaluationText = "";
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: geminiPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });
      evaluationText = chatCompletion.choices[0]?.message?.content || "";
    } catch (err: any) {
      console.warn("Groq writing evaluation error:", err.message);
      return NextResponse.json({
        wordCount,
        score: 8,
        feedback: "Your writing was recorded! AI evaluation is currently unavailable, so we've passed you automatically.",
        grammarScore: 8,
        naturalness: 8,
        variety: 8,
        passed: true,
      });
    }

    let evaluation;
    try {
      const cleaned = evaluationText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      evaluation = {
        score: 5,
        feedback: "Your writing was evaluated. Consider varying your sentence structures more.",
        grammarScore: 5,
        naturalness: 5,
        variety: 5,
        passed: false,
      };
    }

    return NextResponse.json({
      wordCount,
      ...evaluation,
    });
  } catch (error) {
    console.error("Writing evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate writing" },
      { status: 500 }
    );
  }
}
