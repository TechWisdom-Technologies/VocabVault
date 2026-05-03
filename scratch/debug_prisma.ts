import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Checking Word model fields...');
  const word = await prisma.word.findFirst();
  if (word) {
    console.log('Fields found in first word:', Object.keys(word));
  } else {
    console.log('No words found in DB.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
