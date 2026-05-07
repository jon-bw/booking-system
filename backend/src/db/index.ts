import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sqlTable } from 'drizzle-orm/sqlite-core';
import { resolve } from 'path';
import * as schema from './schema.js';

// ── Database Connection ────────────────────────────────────────────────────
const dbPath = resolve(import.meta.dir, '..', 'data.sqlite');
const sqlite = new Database(dbPath);
sqlite.run('PRAGMA journal_mode = WAL;');
sqlite.run('PRAGMA foreign_keys = ON;');

// Tables are defined in schema.ts via Drizzle ORM
// This file handles connection and WAL-mode setup
export const db = drizzle(sqlite, { schema });
export { sqlite };
