
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const wordCount = await prisma.word.count();
  const progressCount = await prisma.wordProgress.count();
  const dailySetCount = await prisma.dailyWordSet.count();

  console.log({
    userCount,
    wordCount,
    progressCount,
    dailySetCount,
  });

  if (userCount > 0) {
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Sample Users:", users.map(u => ({ id: u.id, email: u.email, onboardingComplete: u.onboardingComplete })));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
