import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const word = await prisma.word.findFirst({ orderBy: { orderIndex: 'asc' } });
  console.log('First word orderIndex:', word?.orderIndex);
  process.exit(0);
}

main();
