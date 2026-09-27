import type { FileFilter, Page, FileRecord } from '$lib/types/file';

// Always paginated — never loads the full result set into memory (spec §24).
export interface SearchService {
  search(query: string, filter: FileFilter, cursor: string | null, limit: number): Promise<Page<FileRecord>>;
}
