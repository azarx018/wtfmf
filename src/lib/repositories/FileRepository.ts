import type { FileRecord, FileFilter, Page } from '$lib/types/file';

// Persistence & queries for the `files` table.
// No business logic here — that belongs in services/use-cases.
export interface FileRepository {
  findById(id: number): Promise<FileRecord | null>;
  findByUri(uri: string): Promise<FileRecord | null>;
  query(filter: FileFilter, cursor: string | null, limit: number): Promise<Page<FileRecord>>;
  largest(limit: number, cursor: string | null): Promise<Page<FileRecord>>;
  olderThan(epochMillis: number, cursor: string | null, limit: number): Promise<Page<FileRecord>>;
  upsertMany(files: FileRecord[]): Promise<void>;
  deleteById(id: number): Promise<void>;
  markMissing(id: number): Promise<void>; // file no longer exists on disk (spec §17)
  getAggregateStats(): Promise<{ totalSize: number; totalCount: number }>;
}
