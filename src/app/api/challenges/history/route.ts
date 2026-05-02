import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengedId: user.id }
        ]
      },
      include: {
        word: true,
        challenger: {
          select: { name: true, avatarUrl: true }
        },
        challenged: {
          select: { name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error("Error fetching challenge history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
