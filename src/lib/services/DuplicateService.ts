import type { DuplicateGroup } from '$lib/types/duplicate';
import type { OperationResult } from '$lib/types/result';

// Staged pipeline (ADR-012 #2): same size -> partial hash (xxHash64 over
// fileSize + first 64 KiB + last 64 KiB, candidate filter only) -> full
// SHA-256 (authoritative). Only candidates surviving each stage move to
// the next.
export interface DuplicateService {
  scan(onProgress?: (groupsFoundSoFar: number) => void): Promise<OperationResult<DuplicateGroup[]>>;

  /**
   * Keeps `keepFileId` and attempts to trash every other member of the
   * group. ADR-012 #6: members may live under different StorageProviders
   * with different capabilities (e.g. a read-only SAF location) — this
   * must evaluate canDelete/canMove per member individually rather than
   * assuming the whole group behaves the same way, and must report
   * partial success accurately (some deleted, some failed, some skipped).
   * It must never roll back members that already succeeded.
   */
  keepOne(groupId: number, keepFileId: number): Promise<OperationResult<KeepOneResult>>;
}

export type DuplicateMemberOutcome = 'deleted' | 'failed' | 'skipped';

export interface DuplicateMemberOperationResult {
  fileId: number;
  outcome: DuplicateMemberOutcome;
  reason?: string; // present for 'failed' or 'skipped' (e.g. "canDelete not supported by provider")
}

export interface KeepOneResult {
  keptFileId: number;
  deleted: number;
  failed: number;
  skipped: number;
  members: DuplicateMemberOperationResult[];
}
