import type { SettingsRepository } from '$lib/repositories/SettingsRepository';
import { getDb } from '$lib/db/client';

export class SettingsRepositoryImpl implements SettingsRepository {
  async get(key: string): Promise<string | null> {
    const db = await getDb();
    const rows = await db.query<{ value: string }>('SELECT value FROM settings WHERE key = ?;', [key]);
    return rows[0]?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await getDb();
    await db.run(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [key, value]
    );
  }

  async getAll(): Promise<Record<string, string>> {
    const db = await getDb();
    const rows = await db.query<{ key: string; value: string }>('SELECT key, value FROM settings;');
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }
}
