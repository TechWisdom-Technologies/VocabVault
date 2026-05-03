import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ words: [] });
  }

  try {
    const words = await prisma.word.findMany({
      where: {
        word: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        word: true,
      },
      take: 5,
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
