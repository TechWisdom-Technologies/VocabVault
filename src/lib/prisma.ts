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

// Production vs Development configuration
const isProd = process.env.NODE_ENV === "production";

// Reuse adapter instance to avoid connection pool exhaustion
const adapter =
  globalForPrisma.adapter ??
  new PrismaPg({
    connectionString,
    // Connection pooling settings
    ...(isProd && {
      // In production, be more conservative with connection usage
      query: {
        timeout: 10000, // 10s query timeout
      },
    }),
  });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isProd ? ["error"] : ["error", "warn"],
    errorFormat: "pretty",
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;
}

// Graceful shutdown for both dev and prod
if (typeof global !== "undefined") {
  // This runs once per process lifecycle
  if (!(global as any).prismaShutdownHandled) {
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, closing database connection...");
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received, closing database connection...");
      await prisma.$disconnect();
      process.exit(0);
    });

    (global as any).prismaShutdownHandled = true;
  }
}

export default prisma;
