import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
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

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "PRO" },
        });

        // Send PRO upgrade email
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user && user.email) {
            await resend.emails.send({
              from: `VocabVault <${FROM_EMAIL}>`,
              to: user.email,
              subject: "Welcome to VocabVault PRO!",
              html: `
                <h1>Thank you for upgrading, ${user.name || "Learner"}!</h1>
                <p>Your account has been successfully upgraded to VocabVault PRO.</p>
                <p>You now have unlimited access to all stages and advanced AI evaluations.</p>
                <br/>
                <p>Happy Learning,</p>
                <p>The VocabVault Team</p>
              `,
            });
          }
        } catch (e) {
          console.error("Failed to send PRO upgrade email:", e);
        }

        console.log(`User ${userId} upgraded to PRO`);
      } catch (error) {
        console.error("Error updating user plan to PRO:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
