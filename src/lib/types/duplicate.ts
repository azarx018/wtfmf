import type { FileRecord } from './file';

export interface DuplicateGroup {
  id: number;
  size: number;
  hash: string | null;
  createdAt: number;
  members: FileRecord[];
}
