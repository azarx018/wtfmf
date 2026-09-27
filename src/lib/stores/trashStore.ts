import { writable } from 'svelte/store';
import type { TrashItem } from '$lib/types/trash';
import type { Page } from '$lib/types/file';

interface TrashStoreState {
  page: Page<TrashItem> | null;
  totalSize: number;
  loading: boolean;
}

function createTrashStore() {
  const { subscribe, set, update } = writable<TrashStoreState>({
    page: null,
    totalSize: 0,
    loading: false
  });

  return {
    subscribe,
    setPage: (page: Page<TrashItem>, totalSize: number) => update((s) => ({ ...s, page, totalSize, loading: false })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, loading }))
  };
}

export const trashStore = createTrashStore();
