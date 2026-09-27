export type ScanStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';

export interface ScanSession {
  id: number;
  status: ScanStatus;
  startedAt: number;
  completedAt: number | null;
  filesDiscovered: number;
  errorCount: number;
}

export interface ScanProgress {
  session: ScanSession;
  currentPath: string | null;
  filesProcessed: number;
  filesTotal: number | null; // null until estimable
  findingsSoFar: {
    duplicateBytesEstimate: number;
    largeFileCount: number;
    screenshotCount: number;
  };
}
