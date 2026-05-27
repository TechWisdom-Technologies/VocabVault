import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = sanitizeString(body.category || "GENERAL");
    const subject = sanitizeString(body.subject || "");
    const message = sanitizeString(body.message || "");
    const email = sanitizeString(body.email || "").toLowerCase();

    if (!subject || !message || !email) {
      return NextResponse.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    let userId: string | null = null;

    const authHeader = req.headers.get("authorization");
    const sessionToken = req.headers.get("x-session-token");
    if (authHeader?.startsWith("Bearer ") && sessionToken) {
      const authResult = await validateRequest(req);
      if ("user" in authResult) {
        userId = authResult.user.id;
      }
    }

    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: "We could not find an account for that email. Please log in first or contact support directly." },
          { status: 404 }
        );
      }

      userId = existingUser.id;
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        category: category as any,
        subject,
        message,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "FEEDBACK_RECEIVED",
          title: "New Support Request",
          message: `Support request received for ${email}: "${subject}"`,
          metadata: { feedbackId: feedback.id },
        })),
      });
    }

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    console.error("Support request creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}
