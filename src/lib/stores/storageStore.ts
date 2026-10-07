import { writable } from 'svelte/store';

interface StorageStoreState {
  totalSize: number;
  totalCount: number;
  lastLoadedAt: number | null;
  loading: boolean;
}

function createStorageStore() {
  const { subscribe, update } = writable<StorageStoreState>({
    totalSize: 0,
    totalCount: 0,
    lastLoadedAt: null,
    loading: false
  });

  return {
    subscribe,
    setLoading: (loading: boolean) => update((s) => ({ ...s, loading })),
    setSummary: (totalSize: number, totalCount: number) =>
      update((s) => ({ ...s, totalSize, totalCount, lastLoadedAt: Date.now(), loading: false }))
  };
}

export const storageStore = createStorageStore();
