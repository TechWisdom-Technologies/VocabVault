import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    const progress = await prisma.wordProgress.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: { word: true },
      orderBy: { completedAt: "desc" }
    });

    return NextResponse.json({ words: progress.map((p: any) => p.word) });
  } catch (error) {
    console.error("Error fetching mastered words:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastered words" },
      { status: 500 }
    );
  }
}
