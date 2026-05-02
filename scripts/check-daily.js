/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const totalWords = await prisma.word.count();
    console.log('totalWords:', totalWords);

    const users = await prisma.user.findMany({ take: 10 });

    for (const u of users) {
      const progCount = await prisma.wordProgress.count({ where: { userId: u.id } });
      const today = new Date();
      const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const utcTomorrow = new Date(utcToday);
      utcTomorrow.setUTCDate(utcTomorrow.getUTCDate() + 1);

      const todaysSets = await prisma.dailyWordSet.findMany({
        where: {
          userId: u.id,
          date: { gte: utcToday, lt: utcTomorrow },
        },
        orderBy: { createdAt: 'desc' },
      });

      const progToday = await prisma.wordProgress.findMany({
        where: {
          userId: u.id,
          date: { gte: utcToday, lt: utcTomorrow },
        },
      });

      console.log('---');
      console.log('user:', u.id, u.email, 'plan:', u.plan);
      console.log('wordProgress total:', progCount, 'todayProgressCount:', progToday.length);
      console.log('todays dailySets count:', todaysSets.length);
      if (todaysSets.length > 0) {
        for (const s of todaysSets) {
          console.log(' dailySet:', s.id, 'date:', s.date, 'words:', (s.wordIds || []).length);
        }
      }
    }
  } catch (e) {
    console.error('error running check:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
