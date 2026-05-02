import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { deepgram } from "@/lib/deepgram";
import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/stage/evaluate/speech
 * Receives audio blob, transcribes via Deepgram, evaluates via Gemini.
 * Used by Stage 2 (sentence immersion) and Stage 10 (spoken performance).
 */
export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const originalSentence = formData.get("sentence") as string | null;
    const targetWord = formData.get("targetWord") as string | null;
    const stageType = formData.get("stageType") as string | null; // "immersion" | "performance"

    if (!audioFile || !targetWord) {
      return NextResponse.json(
        { error: "Missing audio file or target word" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Deepgram
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({
        transcript: "",
        score: 0,
        feedback: "We couldn't hear you. Please ensure your microphone is working and try again.",
        passed: false,
      });
    }

    // Step 1: Transcribe with Deepgram
    let transcript = "";
    try {
      const { result } = await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        smart_format: true,
        language: "en",
        punctuate: true,
      });
      transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    } catch (err: any) {
      console.warn("Deepgram error:", err.message);
      // Fall through with empty transcript
    }

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json({
        transcript: "",
        score: 0,
        feedback: "Could not detect any speech or audio was unsupported. Please try again.",
        passed: false,
      });
    }

    // Step 2: Evaluate with Gemini
    let geminiPrompt = "";

    if (stageType === "performance") {
      // Stage 10: Spoken Performance evaluation
      const adminSetting = await prisma.systemSetting.findUnique({
        where: { key: "AI_PROMPT_STAGE_10" }
      });
      const customPromptBehavior = adminSetting?.value || "You are an expert English language evaluator for a vocabulary learning app.";

      geminiPrompt = `${customPromptBehavior}

A learner was asked to speak freely for 1 minute, using the target word "${targetWord}" at least 3 times.

Here is their transcription from a Speech-to-Text AI:
"${transcript}"

Evaluate the following:
1. Count how many times the target word "${targetWord}" appears (any grammatical form).
2. For each usage, is it generally grammatically correct and contextually appropriate?
3. Overall fluency and naturalness of the speech.
4. Ignore minor punctuation, grammar, and spelling errors that might be caused by Speech-to-Text artifacts. Focus on the actual vocabulary usage.
5. Penalize heavily if they just repeated the exact same sentence 3 times robotically.

Respond in this exact JSON format:
{"score": <0-10>, "wordCount": <number>, "fluency": <0-100>, "vocabulary": <0-100>, "feedback": "<2-3 sentence encouraging feedback>", "passed": <true/false>}

Score 8+ means passed. Be forgiving of Speech-to-Text translation errors.`;
    } else {
      // Stage 2: Sentence Immersion evaluation
      geminiPrompt = `You are an expert English pronunciation and fluency evaluator.

The learner was asked to read this exact sentence aloud:
Original: "${originalSentence}"

Here is what the speech-to-text AI actually transcribed:
Spoken: "${transcript}"

Evaluate the accuracy:
1. Ignore minor punctuation, capitalization, and minor homophone errors (e.g., "there" vs "their") since speech-to-text isn't perfect.
2. Focus on whether the core words, especially the target word "${targetWord}", are present and correctly spoken.
3. If the transcribed spoken sentence is highly similar to the original sentence and contains the target word, give a high score (9 or 10).
4. Only give a low score if the spoken text is completely different, nonsensical, or clearly shows they did not read the sentence.

Respond in this exact JSON format:
{"score": <0-10>, "accuracy": <0-100>, "feedback": "<1-2 short, encouraging sentences explaining the score>", "passed": <true/false>}

Score 8+ means passed. Be forgiving of minor speech-to-text artifacts.`;
    }

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
      console.warn("Groq evaluation error:", err.message);
      // Fallback if AI is down
      return NextResponse.json({
        transcript,
        score: 8,
        accuracy: 80,
        feedback: "Your pronunciation was recorded. AI evaluation is currently unavailable, so we've passed you automatically.",
        passed: true,
      });
    }

    // Parse AI response
    let evaluation;
    try {
      const cleaned = evaluationText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      // Fallback if Gemini returns non-JSON
      evaluation = {
        score: 5,
        accuracy: 70,
        feedback: "Evaluation completed but format was unreadable. Moderate performance detected.",
        passed: false,
      };
    }

    return NextResponse.json({
      transcript,
      ...evaluation,
    });
  } catch (error) {
    console.error("Speech evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate speech" },
      { status: 500 }
    );
  }
}
