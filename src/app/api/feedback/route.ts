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

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true }
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: "FEEDBACK_RECEIVED",
          title: "New User Feedback",
          message: `${user.name || user.email} submitted a ${category.replace('_', ' ')} report: "${subject}"`,
          metadata: { feedbackId: feedback.id }
        }))
      });
    }

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error("Feedback creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
