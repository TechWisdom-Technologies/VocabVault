import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/feedback
 * Submit a feedback report.
 */
export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const body = await req.json();
    const { category, subject, message, wordId, stageNumber } = body;

    if (!category || !subject || !message) {
      return NextResponse.json(
        { error: "Category, subject, and message are required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        category,
        subject,
        message,
        wordId: wordId || null,
        stageNumber: stageNumber ? parseInt(stageNumber, 10) : null,
      },
    });

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error("Feedback creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
