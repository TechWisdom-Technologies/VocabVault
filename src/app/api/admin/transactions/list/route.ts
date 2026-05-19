import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Get transactions with user details
    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        status: status as "PENDING" | "VERIFIED" | "REJECTED",
      },
      include: {
        // Include user but only specific fields
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.paymentTransaction.count({
      where: {
        status: status as "PENDING" | "VERIFIED" | "REJECTED",
      },
    });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("List transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
