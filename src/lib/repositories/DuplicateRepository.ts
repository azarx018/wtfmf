import type { DuplicateGroup } from '$lib/types/duplicate';
import type { Page } from '$lib/types/file';

export interface DuplicateRepository {
  listGroups(cursor: string | null, limit: number): Promise<Page<DuplicateGroup>>;
  createGroup(size: number, hash: string | null, memberFileIds: number[]): Promise<DuplicateGroup>;
  removeMember(groupId: number, fileId: number): Promise<void>; // e.g. after "Keep 1" / cleanup
  clearAll(): Promise<void>; // before a fresh duplicate scan pass
}
