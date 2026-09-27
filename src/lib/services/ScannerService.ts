import type { ScanProgress } from '$lib/types/scan';
import type { OperationResult } from '$lib/types/result';

// WTFMF_ENGINEERING_SPEC.md §14–16 — incremental, cancellable, resumable.
export interface ScannerService {
  start(onProgress: (progress: ScanProgress) => void): Promise<OperationResult<ScanProgress>>;
  pause(): Promise<void>;
  resume(onProgress: (progress: ScanProgress) => void): Promise<OperationResult<ScanProgress>>;
  cancel(): Promise<void>;
  hasInterruptedSession(): Promise<boolean>; // scan_sessions.status === RUNNING at last close
}
