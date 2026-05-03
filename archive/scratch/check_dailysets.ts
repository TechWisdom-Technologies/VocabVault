
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dailySets = await prisma.dailyWordSet.findMany({
    orderBy: { date: 'desc' },
    take: 10
  });
  console.log("Daily Sets:", dailySets.map(s => ({ id: s.id, userId: s.userId, date: s.date.toISOString(), wordIds: s.wordIds })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
