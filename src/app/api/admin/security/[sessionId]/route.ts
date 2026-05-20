import { NextRequest, NextResponse } from "next/server";
import { validateRequest, invalidateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { sessionId } = await context.params;

    // Get full session record including sessionToken and user firebaseUid
    const session = await prisma.deviceSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: { firebaseUid: true, email: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // First, invalidate the session in Redis to immediately disconnect the user
    await invalidateSession(session.user.firebaseUid, session.sessionToken);

    // Log the administrative action
    await prisma.adminLog.create({
      data: {
        adminUserId: authResult.user.id,
        action: "TERMINATE_SESSION",
        targetType: "USER",
        targetId: session.userId,
        reason: `Administrative termination of session: ${session.deviceName}`,
        details: { sessionId, userEmail: session.user.email }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json({ error: "Failed to terminate session" }, { status: 500 });
  }
}
