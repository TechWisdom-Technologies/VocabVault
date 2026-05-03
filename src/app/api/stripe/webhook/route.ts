import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const isDevBypass = process.env.NODE_ENV === "development" && req.headers.get("x-dev-bypass") === "true";

    if (isDevBypass) {
      console.log("🛠️ Dev Webhook Bypass active");
      event = JSON.parse(body);
    } else {
      if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    }
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const stripeCustomerId = session.customer as string;
    const stripePaymentId = session.payment_intent as string;

    console.log(`🔔 Webhook received for session ${session.id}. User: ${userId}`);

    if (userId) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            plan: "PRO",
            stripeCustomerId: stripeCustomerId,
            stripePaymentId: stripePaymentId
          },
        });

        console.log(`✅ User ${userId} (${updatedUser.email}) successfully upgraded to PRO`);

        // Send PRO upgrade email
        try {
          if (updatedUser.email) {
            await resend.emails.send({
              from: `VocabVault <${FROM_EMAIL}>`,
              to: updatedUser.email,
              subject: "Welcome to VocabVault PRO!",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h1 style="color: #7c3aed;">Thank you for upgrading, ${updatedUser.name || "Learner"}!</h1>
                  <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully upgraded to <strong>VocabVault PRO</strong>.</p>
                  <p style="font-size: 16px; line-height: 1.6;">You now have unlimited access to:</p>
                  <ul>
                    <li>All learning stages (1-10)</li>
                    <li>Advanced AI evaluations</li>
                    <li>Daily vocabulary boosters</li>
                    <li>Priority support</li>
                  </ul>
                  <p style="font-size: 16px; line-height: 1.6;">Get started now by visiting your dashboard.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
                  <br/><br/>
                  <p style="font-size: 14px; color: #666;">Happy Learning,<br/>The VocabVault Team</p>
                </div>
              `,
            });
          }
        } catch (e) {
          console.error("❌ Failed to send PRO upgrade email:", e);
        }
      } catch (error) {
        console.error("❌ Error updating user plan to PRO in DB:", error);
      }
    } else {
      console.warn("⚠️ No userId found in session metadata or client_reference_id");
    }
  }

  return NextResponse.json({ received: true });
}
