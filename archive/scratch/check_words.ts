
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const words = await prisma.word.findMany();
  console.log("Words in DB:", words.map(w => ({ id: w.id, word: w.word, orderIndex: w.orderIndex })));
  
  const user = await prisma.user.findFirst({
    where: { email: 'intasarasif@gmail.com' } // Assuming this is the active user based on recent activity or sample
  });
  
  if (user) {
    const progress = await prisma.wordProgress.findMany({
      where: { userId: user.id }
    });
    console.log(`Progress for ${user.email}:`, progress.map(p => ({ wordId: p.wordId, status: p.status })));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
