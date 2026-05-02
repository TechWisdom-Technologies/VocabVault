import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, maxUnlockedIndex: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));
  process.exit(0);
}

main();
