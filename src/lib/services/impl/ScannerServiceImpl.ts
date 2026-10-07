import type { ScannerService } from '$lib/services/ScannerService';
import type { ScanProgress, ScanSession } from '$lib/types/scan';
import type { OperationResult } from '$lib/types/result';
import { success, failed, cancelled } from '$lib/types/result';
import type { FileRepository } from '$lib/repositories/FileRepository';
import type { ScanRepository } from '$lib/repositories/ScanRepository';
import { WtfmfScanner, type NativeFileEntry } from '$lib/native/scannerPlugin';
import type { FileRecord } from '$lib/types/file';

function toFileRecord(entry: NativeFileEntry, scanId: number): FileRecord {
  return {
    id: 0, // ignored by FileRepositoryImpl.upsertMany's INSERT (AUTOINCREMENT) — never read
    uri: entry.uri,
    path: entry.path,
    name: entry.name,
    extension: entry.extension,
    mimeType: entry.mimeType,
    size: entry.size,
    modifiedAt: entry.modifiedAt,
    createdAt: null,
    hash: null,
    hashStatus: 'none',
    isDirectory: entry.isDirectory,
    scanId
  };
}

/**
 * Pass 1 only (spec §16): metadata collection via WtfmfScannerPlugin.
 * No hashing, no duplicate detection, no findings beyond raw file counts
 * — those are later passes layered on top of this once Pass 1 is proven
 * solid on-device.
 *
 * Known gap: `pause`/`resume` don't implement true mid-scan resumability
 * (continuing from the exact file the scan was at). `pause` cancels the
 * native walk and marks the session PAUSED; `resume` starts a fresh scan.
 * Real resumability needs a persisted cursor and is deliberately deferred
 * rather than faked.
 */
export class ScannerServiceImpl implements ScannerService {
  private currentSessionId: number | null = null;
  private filesProcessed = 0;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly scanRepository: ScanRepository
  ) {}

  async start(onProgress: (progress: ScanProgress) => void): Promise<OperationResult<ScanProgress>> {
    const session = await this.scanRepository.createSession();
    this.currentSessionId = session.id;
    this.filesProcessed = 0;

    return new Promise((resolve) => {
      let settled = false;

      const batchHandle = WtfmfScanner.addListener('scanBatch', (event) => {
        void (async () => {
          const records = event.files
            .filter((f) => !f.isDirectory)
            .map((f) => toFileRecord(f, session.id));
          await this.fileRepository.upsertMany(records);

          this.filesProcessed = event.filesProcessed;
          await this.scanRepository.updateSession(session.id, { filesDiscovered: event.filesProcessed });

          onProgress(this.buildProgress(session, event.currentPath));
        })();
      });

      const completeHandle = WtfmfScanner.addListener('scanComplete', (event) => {
        void (async () => {
          const finalStatus = event.cancelled ? 'CANCELLED' : 'COMPLETED';
          await this.scanRepository.updateSession(session.id, {
            status: finalStatus,
            completedAt: Date.now(),
            filesDiscovered: event.filesProcessed
          });

          void batchHandle.then((h) => h.remove());
          void completeHandle.then((h) => h.remove());
          void errorHandle.then((h) => h.remove());

          if (!settled) {
            settled = true;
            const finalSession: ScanSession = {
              ...session,
              status: finalStatus,
              completedAt: Date.now(),
              filesDiscovered: event.filesProcessed
            };
            resolve(
              event.cancelled
                ? cancelled()
                : success(this.buildProgress(finalSession, null))
            );
          }
        })();
      });

      const errorHandle = WtfmfScanner.addListener('scanError', (event) => {
        void (async () => {
          await this.scanRepository.updateSession(session.id, {
            status: 'FAILED',
            completedAt: Date.now(),
            errorCount: 1
          });

          void batchHandle.then((h) => h.remove());
          void completeHandle.then((h) => h.remove());
          void errorHandle.then((h) => h.remove());

          if (!settled) {
            settled = true;
            resolve(failed([{ code: 'SCAN_FAILED', message: event.message, recoverable: true }]));
          }
        })();
      });

      WtfmfScanner.startScan().catch((err) => {
        if (!settled) {
          settled = true;
          resolve(
            failed([
              { code: 'SCAN_START_FAILED', message: err?.message ?? String(err), recoverable: true }
            ])
          );
        }
      });
    });
  }

  async pause(): Promise<void> {
    await WtfmfScanner.cancelScan();
    if (this.currentSessionId !== null) {
      await this.scanRepository.updateSession(this.currentSessionId, { status: 'PAUSED' });
    }
  }

  async resume(onProgress: (progress: ScanProgress) => void): Promise<OperationResult<ScanProgress>> {
    // See class doc comment — not a true resume, starts a fresh Pass 1 scan.
    return this.start(onProgress);
  }

  async cancel(): Promise<void> {
    await WtfmfScanner.cancelScan();
    if (this.currentSessionId !== null) {
      await this.scanRepository.updateSession(this.currentSessionId, {
        status: 'CANCELLED',
        completedAt: Date.now()
      });
    }
  }

  async hasInterruptedSession(): Promise<boolean> {
    const interrupted = await this.scanRepository.getInterruptedSession();
    return interrupted !== null;
  }

  private buildProgress(session: ScanSession, currentPath: string | null): ScanProgress {
    return {
      session,
      currentPath,
      filesProcessed: this.filesProcessed,
      filesTotal: null, // not knowable up-front for a filesystem walk
      findingsSoFar: {
        // Pass 1 doesn't compute these yet — Pass 3/4 territory (spec §16).
        duplicateBytesEstimate: 0,
        largeFileCount: 0,
        screenshotCount: 0
      }
    };
  }
}
