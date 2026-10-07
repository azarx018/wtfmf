import type { FileRepository } from '$lib/repositories/FileRepository';
import type { FileRecord, FileFilter, Page } from '$lib/types/file';
import { getDb } from '$lib/db/client';

function toFileRecord(row: Record<string, unknown>): FileRecord {
  return {
    id: row.id as number,
    uri: row.uri as string,
    path: (row.path as string) ?? null,
    name: row.name as string,
    extension: (row.extension as string) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    size: row.size as number,
    modifiedAt: (row.modified_at as number) ?? null,
    createdAt: (row.created_at as number) ?? null,
    hash: (row.hash as string) ?? null,
    hashStatus: (row.hash_status as FileRecord['hashStatus']) ?? 'none',
    isDirectory: Boolean(row.is_directory),
    scanId: (row.scan_id as number) ?? null
  };
}

export class FileRepositoryImpl implements FileRepository {
  async findById(id: number): Promise<FileRecord | null> {
    const db = await getDb();
    const rows = await db.query('SELECT * FROM files WHERE id = ?;', [id]);
    return rows[0] ? toFileRecord(rows[0]) : null;
  }

  async findByUri(uri: string): Promise<FileRecord | null> {
    const db = await getDb();
    const rows = await db.query('SELECT * FROM files WHERE uri = ?;', [uri]);
    return rows[0] ? toFileRecord(rows[0]) : null;
  }

  async query(filter: FileFilter, cursor: string | null, limit: number): Promise<Page<FileRecord>> {
    const db = await getDb();
    const conditions: string[] = ['is_directory = 0'];
    const params: unknown[] = [];

    if (filter.extensions?.length) {
      conditions.push(`extension IN (${filter.extensions.map(() => '?').join(',')})`);
      params.push(...filter.extensions);
    }
    if (filter.mimeTypes?.length) {
      conditions.push(`mime_type IN (${filter.mimeTypes.map(() => '?').join(',')})`);
      params.push(...filter.mimeTypes);
    }
    if (filter.minSize !== undefined) {
      conditions.push('size >= ?');
      params.push(filter.minSize);
    }
    if (filter.maxSize !== undefined) {
      conditions.push('size <= ?');
      params.push(filter.maxSize);
    }
    if (filter.modifiedAfter !== undefined) {
      conditions.push('modified_at >= ?');
      params.push(filter.modifiedAfter);
    }
    if (filter.modifiedBefore !== undefined) {
      conditions.push('modified_at <= ?');
      params.push(filter.modifiedBefore);
    }
    if (filter.searchQuery) {
      conditions.push('name LIKE ?');
      params.push(`%${filter.searchQuery}%`);
    }

    const cursorId = cursor ? Number(cursor) : 0;
    conditions.push('id > ?');
    params.push(cursorId);

    const sql = `SELECT * FROM files WHERE ${conditions.join(' AND ')} ORDER BY id ASC LIMIT ?;`;
    params.push(limit);

    const rows = await db.query(sql, params);
    const items = rows.map(toFileRecord);
    const nextCursor = items.length === limit ? String(items[items.length - 1].id) : null;

    return { items, cursor: nextCursor };
  }

  async largest(limit: number, cursor: string | null): Promise<Page<FileRecord>> {
    const db = await getDb();
    const cursorSize = cursor ? Number(cursor) : Number.MAX_SAFE_INTEGER;
    const rows = await db.query(
      'SELECT * FROM files WHERE is_directory = 0 AND size < ? ORDER BY size DESC LIMIT ?;',
      [cursorSize, limit]
    );
    const items = rows.map(toFileRecord);
    const nextCursor = items.length === limit ? String(items[items.length - 1].size) : null;
    return { items, cursor: nextCursor };
  }

  async olderThan(epochMillis: number, cursor: string | null, limit: number): Promise<Page<FileRecord>> {
    const db = await getDb();
    const cursorId = cursor ? Number(cursor) : 0;
    const rows = await db.query(
      'SELECT * FROM files WHERE is_directory = 0 AND modified_at < ? AND id > ? ORDER BY id ASC LIMIT ?;',
      [epochMillis, cursorId, limit]
    );
    const items = rows.map(toFileRecord);
    const nextCursor = items.length === limit ? String(items[items.length - 1].id) : null;
    return { items, cursor: nextCursor };
  }

  async upsertMany(files: FileRecord[]): Promise<void> {
    if (files.length === 0) return;
    const db = await getDb();

    await db.transaction(async () => {
      for (const file of files) {
        await db.run(
          `INSERT INTO files (uri, path, name, extension, mime_type, size, modified_at, created_at, hash, hash_status, is_directory, scan_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(uri) DO UPDATE SET
             path = excluded.path,
             name = excluded.name,
             extension = excluded.extension,
             mime_type = excluded.mime_type,
             size = excluded.size,
             modified_at = excluded.modified_at,
             scan_id = excluded.scan_id;`,
          [
            file.uri,
            file.path,
            file.name,
            file.extension,
            file.mimeType,
            file.size,
            file.modifiedAt,
            file.createdAt,
            file.hash,
            file.hashStatus,
            file.isDirectory ? 1 : 0,
            file.scanId
          ]
        );
      }
    });
  }

  async deleteById(id: number): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM files WHERE id = ?;', [id]);
  }

  async markMissing(id: number): Promise<void> {
    // Spec §17 — a file that disappeared during/after a scan should be
    // flagged, not silently deleted from the index. schema.sql has no
    // column for this yet (no `is_missing` / `missing_at` field), and
    // reusing an unrelated column (e.g. hash_status) to fake it would be
    // actively wrong, not just incomplete. Left as a documented gap
    // rather than a misleading implementation — needs a schema migration
    // (002_*.sql) before this can do anything real.
    void id;
  }

  async getAggregateStats(): Promise<{ totalSize: number; totalCount: number }> {
    const db = await getDb();
    const rows = await db.query<{ totalSize: number | null; totalCount: number }>(
      'SELECT SUM(size) as totalSize, COUNT(*) as totalCount FROM files WHERE is_directory = 0;'
    );
    return {
      totalSize: rows[0]?.totalSize ?? 0,
      totalCount: rows[0]?.totalCount ?? 0
    };
  }
}
