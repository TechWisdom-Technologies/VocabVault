import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL for Prisma");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaPg | undefined;
};

// Reuse adapter instance in development to avoid connection pool exhaustion
const adapter =
  globalForPrisma.adapter ?? new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Graceful shutdown of connections
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;

  // Properly handle process termination in development
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
  });
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
