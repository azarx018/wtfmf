import { writable, derived } from 'svelte/store';
import type { CleanupFinding } from '$lib/services/CleanupService';

interface CleanupStoreState {
  findings: CleanupFinding[];
  selectedFileIds: Set<number>;
  operationInProgress: boolean;
}

function createCleanupStore() {
  const { subscribe, set, update } = writable<CleanupStoreState>({
    findings: [],
    selectedFileIds: new Set(),
    operationInProgress: false
  });

  return {
    subscribe,
    setFindings: (findings: CleanupFinding[]) => update((s) => ({ ...s, findings })),
    toggleFinding: (fileIds: number[]) =>
      update((s) => {
        const next = new Set(s.selectedFileIds);
        const allSelected = fileIds.every((id) => next.has(id));
        fileIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
        return { ...s, selectedFileIds: next };
      }),
    setOperationInProgress: (v: boolean) => update((s) => ({ ...s, operationInProgress: v })),
    reset: () => set({ findings: [], selectedFileIds: new Set(), operationInProgress: false })
  };
}

export const cleanupStore = createCleanupStore();

export const selectedRecoverableSize = derived(cleanupStore, ($s) =>
  $s.findings
    .filter((f) => f.fileIds.some((id) => $s.selectedFileIds.has(id)))
    .reduce((sum, f) => sum + f.totalSize, 0)
);
