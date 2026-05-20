import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  console.log("/api/payments/manual POST invoked");
  const isDev = process.env.NODE_ENV === "development";
  const manualEnabled = process.env.MANUAL_PAYMENTS_ENABLED === "true";

  if (!isDev && !manualEnabled) {
    return NextResponse.json({ error: "Manual payments are disabled" }, { status: 403 });
  }

  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;
  const { transactionId, mobileNumber, paymentMethod } = await req.json();

  try {
    if (!transactionId || !mobileNumber) {
      return NextResponse.json({ error: "Transaction ID and mobile number are required" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        paymentMethod: paymentMethod || "manual",
        transactionId,
        mobileNumber,
        amount: 499,
        status: "PENDING",
      },
    });

    console.log("Created manual payment tx:", tx.id);

    return NextResponse.json({ success: true, message: "Payment submitted for verification. Admin will review it shortly." });
  } catch (error: any) {
    console.error("Manual payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Diagnostic GET to check route and flags
export async function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const manualEnabled = process.env.MANUAL_PAYMENTS_ENABLED === "true";
  return NextResponse.json({ ok: true, isDev, manualEnabled });
}
