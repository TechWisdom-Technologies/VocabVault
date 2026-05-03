import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await params;
    const body = await req.json();
    const { isLocked, lockReason, role, resetProgress } = body;

    const data: any = {};
    if (typeof isLocked === 'boolean') data.isLocked = isLocked;
    if (lockReason !== undefined) data.lockReason = lockReason;
    if (role) data.role = role;
    if (resetProgress) {
      data.maxUnlockedIndex = 0;
      data.wordsLearned = 0;
      data.totalScore = 0;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Log the action
    let action = isLocked !== undefined ? (isLocked ? "LOCK_ACCOUNT" : "UNLOCK_ACCOUNT") : "UPDATE_USER";
    if (resetProgress) action = "RESET_USER_PROGRESS";
    if (role) action = "CHANGE_USER_ROLE";

    await prisma.adminLog.create({
      data: {
        adminUserId: authResult.user.id,
        action,
        targetType: "USER",
        targetId: userId,
        reason: lockReason || `Administrative ${action.toLowerCase().replace('_', ' ')}`,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
