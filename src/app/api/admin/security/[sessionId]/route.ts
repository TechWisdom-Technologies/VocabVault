import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { sessionId } = await params;

    const session = await prisma.deviceSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, deviceName: true }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.deviceSession.delete({
      where: { id: sessionId },
    });

    // Log the administrative action
    await prisma.adminLog.create({
      data: {
        adminUserId: authResult.user.id,
        action: "TERMINATE_SESSION",
        targetType: "USER",
        targetId: session.userId,
        reason: `Administrative termination of session: ${session.deviceName}`,
        details: { sessionId }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
  }
}
