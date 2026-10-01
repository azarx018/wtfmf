// WTFMF_ENGINEERING_SPEC.md §12–13 — Database Versioning & Migration Failure
//
// Rules this runner must honor:
// - Never jump straight to the newest schema; apply every migration in order.
// - Each migration is transactional — either fully applies or fully rolls back.
// - On failure: stop, do not touch the app's normal DB usage, preserve the
//   previous database, log the error, surface a human-readable recovery message.
// - Support upgrading across multiple versions in one run (v1 -> v2 -> v3 -> v4).

import migration001Sql from './migrations/001_initial.sql?raw';

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

export interface SQLiteConnection {
  execute(sql: string): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  getUserVersion(): Promise<number>;
  setUserVersion(version: number): Promise<void>;
  backup?(label: string): Promise<void>; // optional, used before risky migrations
}

export class MigrationError extends Error {
  constructor(
    public readonly fromVersion: number,
    public readonly failedMigrationVersion: number,
    public readonly cause: unknown
  ) {
    super(
      `Migration to v${failedMigrationVersion} failed (db was at v${fromVersion}). ` +
        `Database left untouched at v${fromVersion}.`
    );
  }
}

export const MIGRATIONS: Migration[] = [
  { version: 1, description: 'initial schema', sql: migration001Sql }
];

export const DATABASE_VERSION = MIGRATIONS.length > 0
  ? Math.max(...MIGRATIONS.map((m) => m.version))
  : 1;

export async function runMigrations(db: SQLiteConnection): Promise<void> {
  const currentVersion = await db.getUserVersion();

  const pending = MIGRATIONS
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    try {
      if (db.backup) {
        await db.backup(`pre-migration-v${migration.version}`);
      }
      await db.transaction(async () => {
        await db.execute(migration.sql);
        await db.setUserVersion(migration.version);
      });
    } catch (cause) {
      // Stop immediately. Do not attempt further migrations.
      // Caller is responsible for showing recovery UI and preventing
      // normal database usage until resolved.
      throw new MigrationError(currentVersion, migration.version, cause);
    }
  }
}
