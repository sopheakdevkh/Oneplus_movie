import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var pgPoolGlobal: Pool | undefined;
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_nW6P1fyLTuhj@ep-steep-glade-b43ehewf-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function getPrismaClient(): PrismaClient {
  const pool =
    globalThis.pgPoolGlobal ??
    new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

  if (process.env.NODE_ENV !== "production") {
    globalThis.pgPoolGlobal = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalThis.prismaGlobal ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
