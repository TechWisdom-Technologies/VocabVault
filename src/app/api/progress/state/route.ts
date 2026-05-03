import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const body = await req.json();
    const { wordId, sessionState } = body;

    if (!wordId) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId },
    });

    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 });
    }

    await prisma.wordProgress.update({
      where: { id: progress.id },
      data: { sessionState: sessionState || Prisma.DbNull },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving session state:", error);
    return NextResponse.json(
      { error: "Failed to save session state" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const url = new URL(req.url);
    const wordId = url.searchParams.get("wordId");

    if (!wordId) {
      return NextResponse.json({ error: "wordId required" }, { status: 400 });
    }

    const progress = await prisma.wordProgress.findFirst({
      where: { userId: user.id, wordId },
      select: { sessionState: true },
    });

    if (!progress) {
      return NextResponse.json({ error: "Progress not found" }, { status: 404 });
    }

    return NextResponse.json({ sessionState: progress.sessionState });
  } catch (error) {
    console.error("Error fetching session state:", error);
    return NextResponse.json(
      { error: "Failed to fetch session state" },
      { status: 500 }
    );
  }
}
