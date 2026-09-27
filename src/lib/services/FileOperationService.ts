import type { OperationResult } from '$lib/types/result';

// The only layer allowed to call a StorageProvider for mutations.
// Every method here checks exists() before acting (spec §17) and never
// silently overwrites on conflict (master prompt / spec §22).
export interface FileOperationService {
  move(fileIds: number[], destinationDirectoryUri: string): Promise<OperationResult<{ movedCount: number }>>;
  copy(fileIds: number[], destinationDirectoryUri: string): Promise<OperationResult<{ copiedCount: number }>>;
  rename(fileId: number, newName: string): Promise<OperationResult<void>>;
  moveToTrash(fileIds: number[]): Promise<OperationResult<{ movedCount: number; totalSize: number }>>;
  restoreFromTrash(trashItemIds: number[]): Promise<OperationResult<{ restoredCount: number }>>;
  deletePermanently(trashItemIds: number[]): Promise<OperationResult<{ deletedCount: number }>>;
}
