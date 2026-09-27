// Single integration point for @capacitor-community/sqlite.
// Repositories import from here — nothing outside src/lib/db/ should
// touch the SQLite plugin directly (WTFMF_ENGINEERING_SPEC.md §3: UI/other
// layers must never access SQLite directly).

import type { SQLiteConnection } from './migrationRunner';

const DB_NAME = 'wtfmf.db';

let connection: SQLiteConnection | null = null;

/**
 * Lazily opens the app database, running any pending migrations first.
 * Safe to call multiple times — returns the same connection.
 */
export async function getDb(): Promise<SQLiteConnection> {
  if (connection) return connection;

  // TODO: wire up @capacitor-community/sqlite here, e.g.:
  //
  // import { CapacitorSQLite, SQLiteConnection as CapSQLiteConnection } from '@capacitor-community/sqlite';
  // const sqlite = new CapSQLiteConnection(CapacitorSQLite);
  // const db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
  // await db.open();
  //
  // connection = adaptToSQLiteConnection(db);
  // await runMigrations(connection);
  // return connection;

  throw new Error('SQLite connection not yet wired up — see src/lib/db/client.ts TODO');
}

export function __resetForTests(): void {
  connection = null;
}
