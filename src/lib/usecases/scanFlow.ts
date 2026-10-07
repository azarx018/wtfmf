import type { ScannerService } from '$lib/services/ScannerService';
import type { FileRepository } from '$lib/repositories/FileRepository';
import { scanStore } from '$lib/stores/scanStore';
import { storageStore } from '$lib/stores/storageStore';
import { uiStore } from '$lib/stores/uiStore';

/** Called on Home screen mount — shows last-known totals without scanning. */
export async function loadStorageSummary(fileRepository: FileRepository): Promise<void> {
  storageStore.setLoading(true);
  const { totalSize, totalCount } = await fileRepository.getAggregateStats();
  storageStore.setSummary(totalSize, totalCount);
}

/** Called from the Scan screen (or Home's "Analyze" quick action). */
export async function startScan(scannerService: ScannerService, fileRepository: FileRepository): Promise<void> {
  scanStore.setStatus('RUNNING');

  const result = await scannerService.start((progress) => {
    scanStore.onProgress(progress);
  });

  if (result.status === 'SUCCESS') {
    await loadStorageSummary(fileRepository);
    uiStore.pushToast({ message: 'Scan complete.', variant: 'success' });
  } else if (result.status === 'CANCELLED') {
    scanStore.setStatus('CANCELLED');
  } else {
    const message = result.errors?.[0]?.message ?? 'Scan failed.';
    scanStore.setError(message);
    uiStore.pushToast({ message: `Scan failed: ${message}`, variant: 'danger' });
  }
}

export async function cancelScan(scannerService: ScannerService): Promise<void> {
  await scannerService.cancel();
}
