import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/user/rules
 * Acknowledge the platform rules.
 */
export async function PATCH(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    await prisma.user.update({
      where: { id: authResult.user.id },
      data: { rulesAcknowledged: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error acknowledging rules:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
