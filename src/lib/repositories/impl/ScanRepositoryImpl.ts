import type { ScanRepository } from '$lib/repositories/ScanRepository';
import type { ScanSession } from '$lib/types/scan';
import { getDb } from '$lib/db/client';

function toScanSession(row: Record<string, unknown>): ScanSession {
  return {
    id: row.id as number,
    status: row.status as ScanSession['status'],
    startedAt: row.started_at as number,
    completedAt: (row.completed_at as number) ?? null,
    filesDiscovered: row.files_discovered as number,
    errorCount: row.error_count as number
  };
}

export class ScanRepositoryImpl implements ScanRepository {
  async createSession(): Promise<ScanSession> {
    const db = await getDb();
    const startedAt = Date.now();
    const result = await db.run(
      `INSERT INTO scan_sessions (status, started_at, completed_at, files_discovered, error_count)
       VALUES ('RUNNING', ?, NULL, 0, 0);`,
      [startedAt]
    );
    return {
      id: result.lastId ?? 0,
      status: 'RUNNING',
      startedAt,
      completedAt: null,
      filesDiscovered: 0,
      errorCount: 0
    };
  }

  async updateSession(id: number, patch: Partial<ScanSession>): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const params: unknown[] = [];

    if (patch.status !== undefined) {
      fields.push('status = ?');
      params.push(patch.status);
    }
    if (patch.completedAt !== undefined) {
      fields.push('completed_at = ?');
      params.push(patch.completedAt);
    }
    if (patch.filesDiscovered !== undefined) {
      fields.push('files_discovered = ?');
      params.push(patch.filesDiscovered);
    }
    if (patch.errorCount !== undefined) {
      fields.push('error_count = ?');
      params.push(patch.errorCount);
    }

    if (fields.length === 0) return;

    params.push(id);
    await db.run(`UPDATE scan_sessions SET ${fields.join(', ')} WHERE id = ?;`, params);
  }

  async getLatestSession(): Promise<ScanSession | null> {
    const db = await getDb();
    const rows = await db.query('SELECT * FROM scan_sessions ORDER BY started_at DESC LIMIT 1;');
    return rows[0] ? toScanSession(rows[0]) : null;
  }

  async getInterruptedSession(): Promise<ScanSession | null> {
    const db = await getDb();
    const rows = await db.query(
      "SELECT * FROM scan_sessions WHERE status = 'RUNNING' ORDER BY started_at DESC LIMIT 1;"
    );
    return rows[0] ? toScanSession(rows[0]) : null;
  }
}
