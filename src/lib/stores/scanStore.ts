import { writable } from 'svelte/store';
import type { ScanProgress, ScanStatus } from '$lib/types/scan';

interface ScanStoreState {
  status: ScanStatus;
  progress: ScanProgress | null;
  error: string | null;
}

function createScanStore() {
  const { subscribe, set, update } = writable<ScanStoreState>({
    status: 'IDLE',
    progress: null,
    error: null
  });

  return {
    subscribe,
    onProgress: (progress: ScanProgress) =>
      update((s) => ({ ...s, status: progress.session.status, progress, error: null })),
    setStatus: (status: ScanStatus) => update((s) => ({ ...s, status })),
    setError: (error: string) => update((s) => ({ ...s, status: 'FAILED', error })),
    reset: () => set({ status: 'IDLE', progress: null, error: null })
  };
}

export const scanStore = createScanStore();
