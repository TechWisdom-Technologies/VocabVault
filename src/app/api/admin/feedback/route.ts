import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  if (authResult.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            profession: true,
            nationality: true,
          }
        },
        word: {
          select: {
            word: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Error fetching admin feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
