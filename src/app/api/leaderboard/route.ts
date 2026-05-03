import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const sortBy = searchParams.get("sortBy");

    const whereClause: any = {
      totalScore: { gt: 0 } // Only show users with a score
    };

    let currentUser: any = null;
    const authResult = await validateRequest(req);
    if (!("error" in authResult)) {
      currentUser = authResult.user;
    }

    if (filter === "friends" || filter === "following") {
      if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      // Find users that this user is following
      const following = await prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      });
      
      const followingIds = following.map(f => f.followingId);
      // Include current user in their own social feed
      followingIds.push(currentUser.id);

      whereClause.id = { in: followingIds };
    }

    const topUsers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        totalScore: true,
        wordsLearned: true,
        currentStreak: true,
        followers: {
          where: { followerId: currentUser?.id || "" },
          select: { id: true }
        }
      },
      orderBy:
        sortBy === "wordsLearned"
          ? [{ wordsLearned: "desc" }, { totalScore: "desc" }]
          : sortBy === "currentStreak"
            ? [{ currentStreak: "desc" }, { totalScore: "desc" }]
            : [{ totalScore: "desc" }, { wordsLearned: "desc" }],
      take: 50,
    });

    // Transform and add social context
    const leaderboard = topUsers.map(u => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      totalScore: u.totalScore,
      wordsLearned: u.wordsLearned,
      currentStreak: u.currentStreak,
      isFollowing: u.followers.length > 0,
      isMe: u.id === currentUser?.id,
      // Priority flag for UI highlighting
      priority: u.followers.length > 0 || u.id === currentUser?.id
    }));

    // If social filter, we might want to ensure ALL friends are visible even if > 50
    // but for now 50 is a reasonable limit for active friends.

    return NextResponse.json({ leaderboard });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
