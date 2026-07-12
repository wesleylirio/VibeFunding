import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

function useRemoteDb() {
  return Boolean(process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN);
}

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle<typeof schema>>;
  tursoClient?: ReturnType<typeof createClient>;
  tursoDb?: ReturnType<typeof drizzleLibsql<typeof schema>>;
  seeded?: boolean;
};

function resolveDbPath() {
  if (process.env.DATABASE_URL?.startsWith("file:")) {
    return process.env.DATABASE_URL.replace("file:", "");
  }
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("://")) {
    return process.env.DATABASE_URL;
  }
  return path.join(process.cwd(), "data", "app.db");
}

// ─── Local SQLite (better-sqlite3, sync) ───

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_url TEXT,
      active_role TEXT NOT NULL DEFAULT 'INVESTOR',
      vibe_balance REAL NOT NULL DEFAULT 0,
      bio TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      logo_emoji TEXT NOT NULL DEFAULT '\u25c6',
      accent_color TEXT NOT NULL DEFAULT '#3b82f6',
      secondary_color TEXT DEFAULT '#22d3ee',
      repository_url TEXT,
      website_url TEXT,
      social_links TEXT NOT NULL DEFAULT '{}',
      brand_pattern TEXT DEFAULT 'nodes',
      founder_id TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'PUBLIC',
      tech_stack TEXT NOT NULL DEFAULT '[]',
      metrics TEXT NOT NULL DEFAULT '{}',
      risks TEXT NOT NULL DEFAULT '[]',
      history TEXT NOT NULL DEFAULT '[]',
      token_symbol TEXT,
      token_name TEXT,
      detailed INTEGER NOT NULL DEFAULT 0,
      trending_score INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS build_rounds (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      target_value REAL NOT NULL,
      funded_value REAL NOT NULL DEFAULT 0,
      starts_at TEXT NOT NULL,
      ends_at TEXT,
      expected_deliverables TEXT NOT NULL DEFAULT '[]',
      risks TEXT NOT NULL DEFAULT '[]',
      public_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resource_requirements (
      id TEXT PRIMARY KEY,
      build_round_id TEXT NOT NULL,
      type TEXT NOT NULL,
      target_amount REAL NOT NULL,
      funded_amount REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS return_mechanisms (
      id TEXT PRIMARY KEY,
      build_round_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      simulated INTEGER NOT NULL DEFAULT 1,
      terms TEXT
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id TEXT PRIMARY KEY,
      investor_id TEXT NOT NULL,
      build_round_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      amount REAL NOT NULL,
      normalized_value REAL NOT NULL,
      build_units REAL NOT NULL DEFAULT 0,
      reward_tokens REAL NOT NULL DEFAULT 0,
      reward_nft_id TEXT,
      settlement_status TEXT NOT NULL DEFAULT 'IMMEDIATE',
      verified_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      investor_id TEXT NOT NULL,
      project_id TEXT,
      asset_type TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      amount REAL NOT NULL,
      simulated_value REAL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nfts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_emoji TEXT NOT NULL DEFAULT '\u25c8',
      rarity TEXT NOT NULL DEFAULT 'Common',
      utility TEXT NOT NULL DEFAULT '[]',
      simulated INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      build_round_id TEXT,
      task_title TEXT NOT NULL,
      task_description TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      harness TEXT NOT NULL,
      model TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'QUEUED',
      started_at TEXT,
      completed_at TEXT,
      public_summary TEXT,
      visibility TEXT NOT NULL DEFAULT 'PUBLIC',
      compute_source TEXT NOT NULL DEFAULT 'AMD Developer Cloud',
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      compute_time_seconds INTEGER DEFAULT 0,
      files_changed INTEGER DEFAULT 0,
      lines_added INTEGER DEFAULT 0,
      lines_removed INTEGER DEFAULT 0,
      tests_total INTEGER DEFAULT 0,
      tests_passed INTEGER DEFAULT 0,
      tests_failed INTEGER DEFAULT 0,
      commit_hash TEXT,
      replay_label TEXT NOT NULL DEFAULT 'Demo replay',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_events (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      public_message TEXT NOT NULL,
      private_payload TEXT,
      visibility TEXT NOT NULL DEFAULT 'PUBLIC',
      delay_ms INTEGER NOT NULL DEFAULT 600,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proofs_of_build (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      build_round_id TEXT,
      agent_run_id TEXT NOT NULL,
      task_title TEXT NOT NULL,
      task_description TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      harness TEXT NOT NULL,
      model TEXT NOT NULL,
      provider TEXT NOT NULL,
      compute_source TEXT NOT NULL,
      input_tokens INTEGER,
      output_tokens INTEGER,
      compute_time_seconds INTEGER,
      normalized_cost REAL,
      files_changed INTEGER NOT NULL DEFAULT 0,
      lines_added INTEGER NOT NULL DEFAULT 0,
      lines_removed INTEGER NOT NULL DEFAULT 0,
      tests_total INTEGER,
      tests_passed INTEGER,
      tests_failed INTEGER,
      commit_hash TEXT,
      repository_url TEXT,
      artifact_root_hash TEXT NOT NULL,
      manifest_hash TEXT NOT NULL,
      manifest_json TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'RECORDED',
      public_summary TEXT NOT NULL,
      gemma_summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS proof_artifacts (
      id TEXT PRIMARY KEY,
      proof_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT,
      hash TEXT NOT NULL,
      size INTEGER,
      visibility TEXT NOT NULL DEFAULT 'PUBLIC',
      content_preview TEXT
    );

    CREATE TABLE IF NOT EXISTS stakeholder_updates (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      build_round_id TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      author_id TEXT NOT NULL,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gemma_insights (
      id TEXT PRIMARY KEY,
      context TEXT NOT NULL,
      project_id TEXT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      risks TEXT NOT NULL DEFAULT '[]',
      strengths TEXT NOT NULL DEFAULT '[]',
      questions TEXT NOT NULL DEFAULT '[]',
      portfolio_impact TEXT,
      sources TEXT NOT NULL DEFAULT '[]',
      provider TEXT NOT NULL DEFAULT 'DEMO',
      generated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gemma_messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      context TEXT NOT NULL,
      project_id TEXT,
      provider TEXT NOT NULL DEFAULT 'DEMO',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS demo_state (
      id TEXT PRIMARY KEY DEFAULT 'default',
      active_role TEXT NOT NULL DEFAULT 'INVESTOR',
      active_user_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      body TEXT NOT NULL,
      build_round_id TEXT,
      proof_id TEXT,
      agent_run_id TEXT,
      likes INTEGER NOT NULL DEFAULT 0,
      dislikes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_reactions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      reactor_key TEXT NOT NULL,
      reaction TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const cols = sqlite
    .prepare("PRAGMA table_info(allocations)")
    .all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("build_units")) {
    sqlite.exec(
      "ALTER TABLE allocations ADD COLUMN build_units REAL NOT NULL DEFAULT 0"
    );
  }
  if (!names.has("settlement_status")) {
    sqlite.exec(
      "ALTER TABLE allocations ADD COLUMN settlement_status TEXT NOT NULL DEFAULT 'IMMEDIATE'"
    );
  }
  if (!names.has("verified_at")) {
    sqlite.exec("ALTER TABLE allocations ADD COLUMN verified_at TEXT");
  }

  const pcols = sqlite
    .prepare("PRAGMA table_info(projects)")
    .all() as { name: string }[];
  const pnames = new Set(pcols.map((c) => c.name));
  if (!pnames.has("social_links")) {
    sqlite.exec(
      "ALTER TABLE projects ADD COLUMN social_links TEXT NOT NULL DEFAULT '{}'"
    );
  }
  if (!pnames.has("secondary_color")) {
    sqlite.exec(
      "ALTER TABLE projects ADD COLUMN secondary_color TEXT DEFAULT '#22d3ee'"
    );
  }
  if (!pnames.has("brand_pattern")) {
    sqlite.exec(
      "ALTER TABLE projects ADD COLUMN brand_pattern TEXT DEFAULT 'nodes'"
    );
  }
}

export function getSqlite() {
  if (globalForDb.sqlite) return globalForDb.sqlite;

  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  ensureSchema(sqlite);
  globalForDb.sqlite = sqlite;
  return sqlite;
}

// ─── Remote Turso / libsql (async) ───

function getTursoClient() {
  if (globalForDb.tursoClient) return globalForDb.tursoClient;
  const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_TOKEN!,
  });
  globalForDb.tursoClient = client;
  return client;
}

const SCHEMA_SQL_PART1 = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar_url TEXT,
  active_role TEXT NOT NULL DEFAULT 'INVESTOR', vibe_balance REAL NOT NULL DEFAULT 0,
  bio TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  short_description TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
  stage TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE',
  logo_emoji TEXT NOT NULL DEFAULT '\u25c6', accent_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#22d3ee', repository_url TEXT, website_url TEXT,
  social_links TEXT NOT NULL DEFAULT '{}', brand_pattern TEXT DEFAULT 'nodes',
  founder_id TEXT NOT NULL, visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  tech_stack TEXT NOT NULL DEFAULT '[]', metrics TEXT NOT NULL DEFAULT '{}',
  risks TEXT NOT NULL DEFAULT '[]', history TEXT NOT NULL DEFAULT '[]',
  token_symbol TEXT, token_name TEXT, detailed INTEGER NOT NULL DEFAULT 0,
  trending_score INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS build_rounds (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL,
  objective TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'DRAFT',
  target_value REAL NOT NULL, funded_value REAL NOT NULL DEFAULT 0,
  starts_at TEXT NOT NULL, ends_at TEXT, expected_deliverables TEXT NOT NULL DEFAULT '[]',
  risks TEXT NOT NULL DEFAULT '[]', public_summary TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS resource_requirements (
  id TEXT PRIMARY KEY, build_round_id TEXT NOT NULL, type TEXT NOT NULL,
  target_amount REAL NOT NULL, funded_amount REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, label TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS return_mechanisms (
  id TEXT PRIMARY KEY, build_round_id TEXT NOT NULL, type TEXT NOT NULL,
  title TEXT NOT NULL, description TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 1, terms TEXT);
CREATE TABLE IF NOT EXISTS allocations (
  id TEXT PRIMARY KEY, investor_id TEXT NOT NULL, build_round_id TEXT NOT NULL,
  project_id TEXT NOT NULL, resource_type TEXT NOT NULL, amount REAL NOT NULL,
  normalized_value REAL NOT NULL, build_units REAL NOT NULL DEFAULT 0,
  reward_tokens REAL NOT NULL DEFAULT 0, reward_nft_id TEXT,
  settlement_status TEXT NOT NULL DEFAULT 'IMMEDIATE', verified_at TEXT,
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY, investor_id TEXT NOT NULL, project_id TEXT,
  asset_type TEXT NOT NULL, asset_symbol TEXT NOT NULL, asset_name TEXT NOT NULL,
  amount REAL NOT NULL, simulated_value REAL, metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS nfts (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT NOT NULL, image_emoji TEXT NOT NULL DEFAULT '\u25c8',
  rarity TEXT NOT NULL DEFAULT 'Common', utility TEXT NOT NULL DEFAULT '[]',
  simulated INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, build_round_id TEXT,
  task_title TEXT NOT NULL, task_description TEXT NOT NULL, agent_name TEXT NOT NULL,
  harness TEXT NOT NULL, model TEXT NOT NULL, provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED', started_at TEXT, completed_at TEXT,
  public_summary TEXT, visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  compute_source TEXT NOT NULL DEFAULT 'AMD Developer Cloud',
  input_tokens INTEGER DEFAULT 0, output_tokens INTEGER DEFAULT 0,
  compute_time_seconds INTEGER DEFAULT 0, files_changed INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0, lines_removed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0, tests_passed INTEGER DEFAULT 0,
  tests_failed INTEGER DEFAULT 0, commit_hash TEXT,
  replay_label TEXT NOT NULL DEFAULT 'Demo replay', created_at TEXT NOT NULL)`;

const SCHEMA_SQL_PART2 = `CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, sequence INTEGER NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL, public_message TEXT NOT NULL,
  private_payload TEXT, visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  delay_ms INTEGER NOT NULL DEFAULT 600, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS proofs_of_build (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, build_round_id TEXT,
  agent_run_id TEXT NOT NULL, task_title TEXT NOT NULL, task_description TEXT NOT NULL,
  agent_name TEXT NOT NULL, harness TEXT NOT NULL, model TEXT NOT NULL,
  provider TEXT NOT NULL, compute_source TEXT NOT NULL, input_tokens INTEGER,
  output_tokens INTEGER, compute_time_seconds INTEGER, normalized_cost REAL,
  files_changed INTEGER NOT NULL DEFAULT 0, lines_added INTEGER NOT NULL DEFAULT 0,
  lines_removed INTEGER NOT NULL DEFAULT 0, tests_total INTEGER, tests_passed INTEGER,
  tests_failed INTEGER, commit_hash TEXT, repository_url TEXT,
  artifact_root_hash TEXT NOT NULL, manifest_hash TEXT NOT NULL,
  manifest_json TEXT NOT NULL, verification_status TEXT NOT NULL DEFAULT 'RECORDED',
  public_summary TEXT NOT NULL, gemma_summary TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS proof_artifacts (
  id TEXT PRIMARY KEY, proof_id TEXT NOT NULL, type TEXT NOT NULL,
  name TEXT NOT NULL, path TEXT, hash TEXT NOT NULL, size INTEGER,
  visibility TEXT NOT NULL DEFAULT 'PUBLIC', content_preview TEXT);
CREATE TABLE IF NOT EXISTS stakeholder_updates (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, build_round_id TEXT,
  title TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'DRAFT',
  author_id TEXT NOT NULL, published_at TEXT, created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS gemma_insights (
  id TEXT PRIMARY KEY, context TEXT NOT NULL, project_id TEXT,
  title TEXT NOT NULL, summary TEXT NOT NULL, risks TEXT NOT NULL DEFAULT '[]',
  strengths TEXT NOT NULL DEFAULT '[]', questions TEXT NOT NULL DEFAULT '[]',
  portfolio_impact TEXT, sources TEXT NOT NULL DEFAULT '[]',
  provider TEXT NOT NULL DEFAULT 'DEMO', generated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS gemma_messages (
  id TEXT PRIMARY KEY, role TEXT NOT NULL, content TEXT NOT NULL,
  context TEXT NOT NULL, project_id TEXT, provider TEXT NOT NULL DEFAULT 'DEMO',
  created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS demo_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  active_role TEXT NOT NULL DEFAULT 'INVESTOR',
  active_user_id TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, body TEXT NOT NULL, build_round_id TEXT, proof_id TEXT,
  agent_run_id TEXT, likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS community_comments (
  id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS community_reactions (
  id TEXT PRIMARY KEY, post_id TEXT NOT NULL, reactor_key TEXT NOT NULL,
  reaction TEXT NOT NULL, created_at TEXT NOT NULL)`;

export async function ensureSchemaRemote() {
  const client = getTursoClient();
  for (const stmt of SCHEMA_SQL_PART1.split(");").filter(Boolean)) {
    const sql = stmt.trim() + ");";
    if (sql.length > 5) await client.execute(sql);
  }
  for (const stmt of SCHEMA_SQL_PART2.split(");").filter(Boolean)) {
    const sql = stmt.trim() + ");";
    if (sql.length > 5) await client.execute(sql);
  }
}

export function getDb() {
  if (globalForDb.db) return globalForDb.db;
  if (useRemoteDb()) {
    const client = getTursoClient();
    const db = drizzleLibsql(client, { schema });
    globalForDb.db = db as unknown as ReturnType<typeof drizzle<typeof schema>>;
  } else {
    const sqlite = getSqlite();
    const db = drizzle(sqlite, { schema });
    globalForDb.db = db;
  }
  return globalForDb.db;
}

export { schema };
