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

    if (filter === "friends") {
      if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      // Find users that this user is following
      const following = await prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      });
      
      const followingIds = following.map(f => f.followingId);
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
      },
      orderBy:
        sortBy === "wordsLearned"
          ? [{ wordsLearned: "desc" }, { totalScore: "desc" }]
          : sortBy === "currentStreak"
            ? [{ currentStreak: "desc" }, { totalScore: "desc" }]
            : [{ totalScore: "desc" }, { wordsLearned: "desc" }],
      take: 50,
    });

    let leaderboard = topUsers;

    if (currentUser) {
      const myFollows = await prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true }
      });
      const followSet = new Set(myFollows.map(f => f.followingId));

      leaderboard = topUsers.map(u => ({
        ...u,
        isFollowing: followSet.has(u.id)
      }));
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
