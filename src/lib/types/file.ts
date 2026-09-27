// Mirrors the `files` table in src/lib/db/schema.sql — keep in sync.

export type HashStatus = 'none' | 'partial' | 'full';

export interface FileRecord {
  id: number;
  uri: string;
  path: string | null;
  name: string;
  extension: string | null;
  mimeType: string | null;
  size: number;
  modifiedAt: number | null; // epoch millis
  createdAt: number | null;
  hash: string | null;
  hashStatus: HashStatus;
  isDirectory: boolean;
  scanId: number | null;
}

export interface FileFilter {
  extensions?: string[];
  mimeTypes?: string[];
  categoryId?: number;
  minSize?: number;
  maxSize?: number;
  modifiedAfter?: number;
  modifiedBefore?: number;
  searchQuery?: string;
}

export interface Page<T> {
  items: T[];
  cursor: string | null; // opaque cursor for the next page; null = no more
  totalEstimate?: number;
}
