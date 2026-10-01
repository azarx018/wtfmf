// Single integration point for @capacitor-community/sqlite. Repositories
// import getDb() from here — nothing outside src/lib/db/ should touch the
// SQLite plugin directly (WTFMF_ENGINEERING_SPEC.md §3: UI/other layers
// must never access SQLite directly).
//
// UNTESTED ON DEVICE as of this writing — same caveat as the permission
// plugin had before its first real build: this compiles against the
// documented @capacitor-community/sqlite v6 API, but hasn't been run on
// the actual Redmi 10 yet. If getDb() throws, that's the first thing to
// suspect.

import { CapacitorSQLite, SQLiteConnection as CapacitorSQLiteConnection } from '@capacitor-community/sqlite';
import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { runMigrations, type SQLiteConnection as MigrationConnection } from './migrationRunner';

const DB_NAME = 'wtfmf';

/**
 * Superset of the narrow interface migrationRunner.ts needs — repositories
 * get `query`/`run` for actual parameterized reads/writes, which the
 * migration runner itself never needed (it only runs whole-file DDL).
 */
export interface AppDatabase extends MigrationConnection {
  run(sql: string, params?: unknown[]): Promise<{ changes: number; lastId?: number }>;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}

class CapacitorSQLiteAdapter implements AppDatabase {
  constructor(private readonly db: SQLiteDBConnection) {}

  async execute(sql: string): Promise<void> {
    await this.db.execute(sql);
  }

  async run(sql: string, params: unknown[] = []): Promise<{ changes: number; lastId?: number }> {
    const result = await this.db.run(sql, params);
    return {
      changes: result.changes?.changes ?? 0,
      lastId: result.changes?.lastId
    };
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return (result.values ?? []) as T[];
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.db.beginTransaction();
    try {
      const result = await fn();
      await this.db.commitTransaction();
      return result;
    } catch (err) {
      await this.db.rollbackTransaction();
      throw err;
    }
  }

  // PRAGMA user_version, not a plugin-specific API — works on any SQLite
  // connection regardless of wrapper version, deliberately avoiding
  // reliance on a getVersion()-style helper method we couldn't verify
  // exists on this exact plugin version without network access to check docs.
  async getUserVersion(): Promise<number> {
    const rows = await this.query<{ user_version: number }>('PRAGMA user_version;');
    return rows[0]?.user_version ?? 0;
  }

  async setUserVersion(version: number): Promise<void> {
    await this.execute(`PRAGMA user_version = ${version};`);
  }
}

let connection: AppDatabase | null = null;
let connecting: Promise<AppDatabase> | null = null;

/**
 * Lazily opens the app database, running any pending migrations first.
 * Safe to call concurrently — every caller awaits the same in-flight
 * connection attempt rather than racing to open the DB twice.
 */
export async function getDb(): Promise<AppDatabase> {
  if (connection) return connection;
  if (connecting) return connecting;

  connecting = (async () => {
    const sqlite = new CapacitorSQLiteConnection(CapacitorSQLite);

    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    const db: SQLiteDBConnection = isConn
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);

    await db.open();

    const adapter = new CapacitorSQLiteAdapter(db);
    await runMigrations(adapter);

    connection = adapter;
    connecting = null;
    return adapter;
  })();

  return connecting;
}

export function __resetForTests(): void {
  connection = null;
  connecting = null;
}
