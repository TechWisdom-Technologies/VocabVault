import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { rulesAcknowledged: true }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rules Acknowledgment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
