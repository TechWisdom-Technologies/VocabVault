import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const user = users[0];

  // Delete all daily sets to reset
  await prisma.dailyWordSet.deleteMany();
  await prisma.wordProgress.deleteMany();

  // Also I'll manually recreate the progress for ubiquitous and ephemeral properly so it shows up.
  // We'll let the user hit the API first, which will create the daily set and progress,
  // THEN we'll update it? Or we can just seed it here.

  const words = await prisma.word.findMany({ orderBy: { orderIndex: 'asc' }});
  
  const today = new Date();
  today.setHours(0,0,0,0);

  // 1. Create DailyWordSet
  await prisma.dailyWordSet.create({
    data: {
      userId: user.id,
      date: today,
      wordIds: words.slice(0, 5).map(w => w.id),
    }
  });

  // 2. Create WordProgress
  for (const word of words.slice(0, 5)) {
    let status = "IN_PROGRESS";
    let currentStage = 1;
    let totalScore = 0;

    if (word.word === 'ubiquitous') {
      status = "COMPLETED";
      currentStage = 10;
      totalScore = 100;
    } else if (word.word === 'ephemeral') {
      status = "IN_PROGRESS";
      currentStage = 5;
    }

    await prisma.wordProgress.create({
      data: {
        userId: user.id,
        wordId: word.id,
        date: today,
        status: status as any,
        currentStage,
        totalScore,
      }
    });
  }

  console.log("Daily word set and progress successfully recreated and restored!");
}

main().finally(() => prisma.$disconnect());
