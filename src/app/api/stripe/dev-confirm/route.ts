import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // ONLY allow this in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const { transactionId, mobileNumber } = await req.json();

  try {
    if (!transactionId || !mobileNumber) {
      return NextResponse.json(
        { error: "Transaction ID and mobile number are required" },
        { status: 400 }
      );
    }

    // Create a pending payment transaction instead of upgrading immediately
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        paymentMethod: "bkash", // Could be bkash or nagad, defaulting to bkash for now
        transactionId,
        mobileNumber,
        amount: 499,
        status: "PENDING",
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Payment submitted for verification. Admin will review it shortly."
    });
  } catch (error: any) {
    console.error("Dev Confirm Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
