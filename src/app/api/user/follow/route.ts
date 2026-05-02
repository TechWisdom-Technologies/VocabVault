import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId || targetUserId === user.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    // Check if the user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if currently following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "UNFOLLOW_USER",
          metadata: { targetUserId },
        },
      });
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          actionType: "FOLLOW_USER",
          metadata: { targetUserId },
        },
      });
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    );
  }
}
