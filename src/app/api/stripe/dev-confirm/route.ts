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

  try {
    // Try to find the real customer ID from Stripe first
    let stripeCustomerId = "cus_dev_" + user.id.slice(0, 8);
    try {
      const { stripe } = require("@/lib/stripe");
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      } else {
        // If not found, CREATE one so the portal actually works
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || "Dev User",
          metadata: { userId: user.id }
        });
        stripeCustomerId = customer.id;
      }
    } catch (e) {
      console.warn("Could not fetch real Stripe customer in dev-confirm", e);
    }

    // Force upgrade the user in dev mode with the best available ID
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        plan: "PRO",
        stripeCustomerId: stripeCustomerId,
        stripePaymentId: "pi_dev_" + Date.now()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Dev Confirm Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
