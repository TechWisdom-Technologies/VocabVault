import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    // Use today's date as a seed so the word stays the same all day
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const totalWords = await prisma.word.count();
    if (totalWords === 0) {
      return NextResponse.json({ word: null });
    }

    const index = dateSeed % totalWords;

    const word = await prisma.word.findFirst({
      orderBy: { orderIndex: "asc" },
      skip: index,
      take: 1,
      select: {
        id: true,
        word: true,
        phonetic: true,
        partOfSpeech: true,
        definition: true,
        synonyms: true,
        sentences: true,
      },
    });

    return NextResponse.json({ word });
  } catch (error) {
    console.error("Error fetching word of the day:", error);
    return NextResponse.json({ error: "Failed to fetch word of the day" }, { status: 500 });
  }
}
