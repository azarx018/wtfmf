import { writable } from 'svelte/store';
import type { FileFilter, FileRecord, Page } from '$lib/types/file';

// IMPORTANT (spec §6): this store holds only the CURRENT PAGE of results,
// never the full file index. Repositories/services own pagination.
interface FileStoreState {
  filter: FileFilter;
  currentPage: Page<FileRecord> | null;
  selectedIds: Set<number>;
  loading: boolean;
}

function createFileStore() {
  const { subscribe, set, update } = writable<FileStoreState>({
    filter: {},
    currentPage: null,
    selectedIds: new Set(),
    loading: false
  });

  return {
    subscribe,
    setFilter: (filter: FileFilter) => update((s) => ({ ...s, filter, selectedIds: new Set() })),
    setPage: (page: Page<FileRecord>) => update((s) => ({ ...s, currentPage: page, loading: false })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, loading })),
    toggleSelection: (id: number) =>
      update((s) => {
        const next = new Set(s.selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        return { ...s, selectedIds: next };
      }),
    clearSelection: () => update((s) => ({ ...s, selectedIds: new Set() }))
  };
}

export const fileStore = createFileStore();
