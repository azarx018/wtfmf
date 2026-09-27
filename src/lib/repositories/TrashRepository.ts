import type { TrashItem } from '$lib/types/trash';
import type { Page } from '$lib/types/file';

export interface TrashRepository {
  add(item: Omit<TrashItem, 'id'>): Promise<TrashItem>;
  list(cursor: string | null, limit: number): Promise<Page<TrashItem>>;
  remove(id: number): Promise<void>; // called after restore or permanent delete
  totalSize(): Promise<number>;
}
