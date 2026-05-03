const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const USER_EMAIL = "official@techwisdom.site"; // Mujahid Raj

async function upgrade() {
  console.log(`🚀 Upgrading ${USER_EMAIL} to ACTUAL PRO...`);

  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email: USER_EMAIL }
    });

    if (!user) {
      console.error("❌ User not found in database!");
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.id})`);

    // 2. Create a REAL customer in Stripe
    console.log("💳 Creating real Stripe Test Customer...");
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || "Test User",
      metadata: {
        userId: user.id
      }
    });

    console.log(`✅ Stripe Customer Created: ${customer.id}`);

    // 3. Update User in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "PRO",
        stripeCustomerId: customer.id,
        stripePaymentId: "manual_dev_upgrade_" + Date.now()
      }
    });

    console.log("✨ SUCCESS! Your account is now an ACTUAL PRO user.");
    console.log("🔗 You can now see this customer in your Stripe Dashboard at: https://dashboard.stripe.com/test/customers/" + customer.id);
    console.log("👉 Refresh your dashboard at http://localhost:3000/dashboard");

  } catch (error) {
    console.error("❌ Error during upgrade:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

upgrade();
