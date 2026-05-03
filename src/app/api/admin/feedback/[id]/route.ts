import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    // Optional: Log this action in ActivityLog
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        actionType: "FEEDBACK_STATUS_UPDATE",
        metadata: { feedbackId: id, newStatus: status },
      },
    });

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error) {
    console.error("Feedback update error:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
