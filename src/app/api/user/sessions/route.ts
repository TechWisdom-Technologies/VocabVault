import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/sessions
 * Returns a list of all active device sessions for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const sessions = await prisma.deviceSession.findMany({
      where: { userId: user.id },
      orderBy: { lastActive: "desc" },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        os: true,
        ipAddress: true,
        locationCity: true,
        locationCountry: true,
        lastActive: true,
        createdAt: true,
        sessionToken: true // We'll use this to identify the "current" session
      }
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Fetch Sessions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
