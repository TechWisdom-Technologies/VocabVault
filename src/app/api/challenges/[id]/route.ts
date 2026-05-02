import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const resolvedParams = await params;
    const challenge = await prisma.challenge.findUnique({
      where: { id: resolvedParams.id },
      include: {
        word: true,
        challenger: {
          select: { id: true, name: true, avatarUrl: true }
        },
        challenged: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
