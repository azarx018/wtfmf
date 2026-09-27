import type { ScanSession } from '$lib/types/scan';

export interface ScanRepository {
  createSession(): Promise<ScanSession>;
  updateSession(id: number, patch: Partial<ScanSession>): Promise<void>;
  getLatestSession(): Promise<ScanSession | null>;
  getInterruptedSession(): Promise<ScanSession | null>; // status === RUNNING at last app close
}
