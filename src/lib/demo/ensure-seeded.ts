import { getSqlite, ensureSchemaRemote, getDb } from "@/lib/db";
import { seedDatabase } from "@/lib/db/seed";
import { users } from "@/lib/db/schema";
import { count } from "drizzle-orm";

const globalSeed = globalThis as unknown as { __vfSeeded?: boolean };

function useRemoteDb() {
  return Boolean(process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN);
}

export async function ensureSeeded() {
  if (globalSeed.__vfSeeded) return;

  if (useRemoteDb()) {
    await ensureSchemaRemote();
    const db = getDb() as any;
    const row = await db.select({ c: count() }).from(users).get();
    if (!row || row.c === 0) {
      await seedDatabase();
    }
  } else {
    const sqlite = getSqlite();
    const row = sqlite.prepare("SELECT COUNT(*) as c FROM users").get() as {
      c: number;
    };
    if (row.c === 0) {
      await seedDatabase();
    }
  }

  globalSeed.__vfSeeded = true;
}
