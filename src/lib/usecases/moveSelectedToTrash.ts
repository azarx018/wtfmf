// Example use-case wiring the flow documented in WTFMF_ENGINEERING_SPEC.md §42:
//
//   UI (Cleanup Review screen)
//     -> cleanupStore.setOperationInProgress(true)
//     -> CleanupService.moveToTrash()
//     -> FileOperationService
//     -> StorageProvider
//     -> Filesystem
//     -> TrashRepository
//     -> SQLite
//     -> cleanupStore / trashStore refresh
//
// This file is the ONLY place a +page.svelte should call into for this
// action — pages must not call services directly (spec §3: UI never
// talks to SQLite/filesystem, and by convention not to services either,
// to keep use-cases as the single seam for orchestration + store updates).

import type { CleanupService } from '$lib/services/CleanupService';
import { cleanupStore } from '$lib/stores/cleanupStore';
import { uiStore } from '$lib/stores/uiStore';
import type { OperationResult } from '$lib/types/result';

export async function moveSelectedToTrash(
  cleanupService: CleanupService,
  selectedFileIds: number[]
): Promise<OperationResult<{ movedCount: number; totalSize: number }>> {
  cleanupStore.setOperationInProgress(true);

  const result = await cleanupService.moveToTrash(selectedFileIds);

  cleanupStore.setOperationInProgress(false);

  if (result.status === 'SUCCESS' || result.status === 'PARTIAL_SUCCESS') {
    uiStore.pushToast({
      message: `Moved ${result.data?.movedCount ?? 0} files to Trash.`,
      variant: result.status === 'SUCCESS' ? 'success' : 'warning'
    });
    cleanupStore.reset();
  } else {
    uiStore.pushToast({
      message: 'Could not move files to Trash. Nothing was changed.',
      variant: 'danger'
    });
  }

  return result;
}
