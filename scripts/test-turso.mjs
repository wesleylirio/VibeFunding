import { createClient } from '@libsql/client';
const c = createClient({ url: "libsql://vibefunding-wesleylirio.turso.io", authToken: process.env.TURSO_DB_TOKEN });
const sql = "CREATE TABLE IF NOT EXISTS test_abc123 (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Test value');";
c.execute(sql).then(r => console.log('OK:', r)).catch(e => console.error('ERR:', e.message, e.cause));
