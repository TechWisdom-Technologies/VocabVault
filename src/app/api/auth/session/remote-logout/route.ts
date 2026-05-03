import { NextRequest, NextResponse } from "next/server";
import { validateRequest, invalidateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/session/remote-logout
 * Allows a user to remotely terminate one of their other active sessions.
 */
export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    // 1. Find the device session to ensure it belongs to the user
    const session = await prisma.deviceSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
    }

    // 2. Invalidate in Redis and DB
    await invalidateSession(session.user.firebaseUid, session.sessionToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remote Logout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
