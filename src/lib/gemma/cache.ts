import { createHash } from "crypto";

export type CacheEntry<T> = {
  value: T;
  provider: string;
  model?: string;
  latencyMs?: number;
  requestId?: string;
  createdAt: number;
  contextType: string;
};

const globalCache = globalThis as unknown as {
  __gemmaCache?: Map<string, CacheEntry<unknown>>;
};

function store() {
  if (!globalCache.__gemmaCache) {
    globalCache.__gemmaCache = new Map();
  }
  return globalCache.__gemmaCache;
}

export function contextHash(contextType: string, payload: unknown): string {
  const raw = JSON.stringify({ contextType, payload });
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export function getCached<T>(
  key: string,
  ttlMs = Number(process.env.GEMMA_CACHE_TTL_MS || 15 * 60 * 1000)
): CacheEntry<T> | null {
  const entry = store().get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.createdAt > ttlMs) {
    store().delete(key);
    return null;
  }
  return entry;
}

export function setCache<T>(
  key: string,
  entry: Omit<CacheEntry<T>, "createdAt"> & { createdAt?: number }
) {
  store().set(key, {
    ...entry,
    createdAt: entry.createdAt ?? Date.now(),
  } as CacheEntry<unknown>);
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store().clear();
    return;
  }
  for (const key of store().keys()) {
    if (key.startsWith(prefix)) store().delete(key);
  }
}

export function getLatestByContext(contextType: string): CacheEntry<unknown> | null {
  let latest: CacheEntry<unknown> | null = null;
  for (const entry of store().values()) {
    if (entry.contextType !== contextType) continue;
    if (!latest || entry.createdAt > latest.createdAt) latest = entry;
  }
  return latest;
}
