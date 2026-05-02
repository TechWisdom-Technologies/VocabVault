import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const user = users[0];
  console.log("Found user:", user.id);

  const progress = await prisma.wordProgress.findMany({ where: { userId: user.id } });
  console.log("Total word progress records:", progress.length);

  const dailySets = await prisma.dailyWordSet.findMany({ where: { userId: user.id } });
  console.log("Total daily sets:", dailySets.length);

  const words = await prisma.word.findMany();
  console.log("Total words in DB:", words.length);
}

main().finally(() => {
  // eslint-disable-next-line
  prisma.$disconnect();
});
