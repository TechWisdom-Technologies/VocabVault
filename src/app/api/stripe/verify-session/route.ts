import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;

  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "No session ID" }, { status: 400 });
  }

  try {
    // 1. Fetch the REAL session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Verify it's actually paid and belongs to this user
    if (session.payment_status === "paid" && (session.client_reference_id === user.id || session.metadata?.userId === user.id)) {
      
      const stripeCustomerId = session.customer as string;
      const stripePaymentId = session.payment_intent as string;

      // 3. Update the database with the REAL Stripe data
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          plan: "PRO",
          stripeCustomerId: stripeCustomerId,
          stripePaymentId: stripePaymentId
        },
      });

      console.log(`✅ Session Verified: User ${user.email} upgraded with Real Stripe ID ${stripeCustomerId}`);
      
      return NextResponse.json({ success: true, plan: updatedUser.plan });
    }

    return NextResponse.json({ error: "Session not paid or unauthorized" }, { status: 400 });
  } catch (error: any) {
    console.error("Session Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
