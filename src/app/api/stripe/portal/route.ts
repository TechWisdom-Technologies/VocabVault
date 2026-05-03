import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user } = authResult;

  try {
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      // Self-healing: Try to find the customer in Stripe by email if the ID is missing in our DB
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        
        // Sync it back to our DB so we don't have to search next time
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId }
        });
        
        console.log(`🔧 Self-healed: Linked missing Stripe ID ${stripeCustomerId} to user ${user.email}`);
      } else {
        return NextResponse.json(
          { 
            error: "No active billing record found",
            details: "We couldn't find a Stripe customer record for your email. Please ensure you have completed a checkout."
          },
          { status: 404 }
        );
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create portal session",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
