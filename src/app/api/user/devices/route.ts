import { NextRequest, NextResponse } from "next/server";
import { validateRequest, invalidateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, userSessionsKey, sessionKey } from "@/lib/redis";

/**
 * GET /api/user/devices
 * List active device sessions for the user.
 */
export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const devices = await prisma.deviceSession.findMany({
      where: { userId: authResult.user.id },
      orderBy: { lastActive: "desc" },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/devices
 * Revoke a specific device session.
 */
export async function DELETE(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token required" },
        { status: 400 }
      );
    }

    // Don't allow revoking current session via this endpoint
    const currentToken = req.headers.get("x-session-token");
    if (sessionToken === currentToken) {
      return NextResponse.json(
        { error: "Cannot revoke current session" },
        { status: 400 }
      );
    }

    await invalidateSession(authResult.user.firebaseUid, sessionToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking device:", error);
    return NextResponse.json(
      { error: "Failed to revoke device" },
      { status: 500 }
    );
  }
}
