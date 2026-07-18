import { resolve, isAbsolute } from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 (engine "client") braucht einen Driver-Adapter. SQLite via better-sqlite3.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// DATABASE_URL kann "file:./dev.db" (relativ) oder absolut sein. better-sqlite3 braucht
// einen realen Pfad — relative Angaben robust gegen das cwd aufloesen.
function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  const path = raw.replace(/^file:/, "");
  const abs = isAbsolute(path) ? path : resolve(process.cwd(), path);
  return `file:${abs}`;
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDbUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
