import type { OperationResult } from '$lib/types/result';

export interface CleanupFinding {
  category: 'duplicates' | 'old_apks' | 'old_downloads' | 'large_recordings' | 'empty_folders' | 'large_archives';
  label: string; // UI copy — "Old APKs", never "Safe to delete X"
  fileIds: number[];
  totalSize: number;
}

// Wording rule (UI/UX rules §15, spec §11): "Potentially removable", never
// "Safe to delete". Nothing here deletes anything — it only moves to Trash
// after explicit user confirmation upstream.
export interface CleanupService {
  getFindings(): Promise<CleanupFinding[]>;
  moveToTrash(fileIds: number[]): Promise<OperationResult<{ movedCount: number; totalSize: number }>>;
}
