import { getSqlite } from "@/lib/db";
import { seedDatabase } from "@/lib/db/seed";

const globalSeed = globalThis as unknown as { __vfSeeded?: boolean };

export function ensureSeeded() {
  if (globalSeed.__vfSeeded) return;
  const sqlite = getSqlite();
  const row = sqlite.prepare("SELECT COUNT(*) as c FROM users").get() as {
    c: number;
  };
  if (row.c === 0) {
    seedDatabase();
  }
  globalSeed.__vfSeeded = true;
}
