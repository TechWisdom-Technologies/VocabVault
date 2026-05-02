import { config } from "dotenv";
config({ path: ".env.local" });
import { getAdminAuth } from "./src/lib/firebase/admin";
import { prisma } from "./src/lib/prisma";

async function createTestUser() {
  try {
    const userRecord = await getAdminAuth().createUser({
      email: "test@example.com",
      password: "Password123!",
      emailVerified: true,
    });

    await prisma.user.create({
      data: {
        firebaseUid: userRecord.uid,
        email: userRecord.email!,
        onboardingComplete: false,
        rulesAcknowledged: false,
      },
    });

    console.log("Test user created successfully!");
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser();
