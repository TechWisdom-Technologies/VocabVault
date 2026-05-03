import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found");
    return;
  }
  
  const user = users[0];
  console.log("Found user:", user.id);

  const words = await prisma.word.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  if (words.length < 2) {
    console.log("Not enough words seeded");
    return;
  }

  const ubiquitous = words.find(w => w.word === 'ubiquitous');
  const ephemeral = words.find(w => w.word === 'ephemeral');

  if (!ubiquitous || !ephemeral) return;

  // Restore ubiquitous
  await prisma.wordProgress.updateMany({
    where: { userId: user.id, wordId: ubiquitous.id },
    data: {
      status: "COMPLETED",
      currentStage: 10,
      totalScore: 100,
    }
  });

  // Restore ephemeral
  await prisma.wordProgress.updateMany({
    where: { userId: user.id, wordId: ephemeral.id },
    data: {
      status: "IN_PROGRESS",
      currentStage: 5,
    }
  });

  console.log("Progress restored successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
