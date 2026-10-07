import { get } from 'svelte/store';
import type { PermissionService } from '$lib/services/PermissionService';
import { permissionStore } from '$lib/stores/permissionStore';
import { uiStore } from '$lib/stores/uiStore';

function isUsable(state: string): boolean {
  return state === 'FULL' || state === 'PARTIAL';
}

/** Called once on app start / onboarding screen mount — never prompts anything by itself. */
export async function checkPermissionOnLoad(permissionService: PermissionService): Promise<void> {
  const snapshot = await permissionService.getCurrent();
  permissionStore.setSnapshot(snapshot);
}

/**
 * "Manage All Files" button on the onboarding screen (UI/UX rules §25).
 *
 * This only launches the Settings screen and returns almost immediately —
 * the All Files Access screen is a toggle with no confirm action, so there
 * is no meaningful result to wait for here. The actual transition to
 * granted access is detected by recheckPermissionOnResume below, once the
 * user comes back to the app (see WtfmfPermissionPlugin.java's
 * requestFullAccess for why this used to hang instead).
 */
export async function requestFullStorageAccess(permissionService: PermissionService): Promise<void> {
  const snapshot = await permissionService.requestFullAccess();
  permissionStore.setSnapshot(snapshot);
}

/** "Choose Folders Instead" button on the onboarding screen. */
export async function requestSafFolderAccess(permissionService: PermissionService): Promise<void> {
  const snapshot = await permissionService.requestSafFolders();
  permissionStore.setSnapshot(snapshot);
  if (snapshot.safRoots.length > 0) {
    uiStore.pushToast({ message: 'Folder access granted.', variant: 'success' });
  }
}

/**
 * Re-check on every app resume (spec §10 — never assume permission still
 * holds, e.g. user revoked it from Android Settings while backgrounded,
 * or just granted it there — see requestFullStorageAccess above).
 * Wired up once in src/lib/bootstrap.ts.
 *
 * IMPORTANT: `previous` must come from the store's last-set snapshot, not
 * another live native call — two live calls made back-to-back always
 * report the same actual OS state, which silently made the revoked/granted
 * comparison below a no-op the first time this was written.
 */
export async function recheckPermissionOnResume(permissionService: PermissionService): Promise<void> {
  const previous = get(permissionStore);
  const snapshot = await permissionService.refresh();
  permissionStore.setSnapshot(snapshot);

  const wasUsable = isUsable(previous.state);
  const nowUsable = isUsable(snapshot.state);

  if (wasUsable && !nowUsable) {
    uiStore.pushToast({
      message: 'Storage access was revoked. WTFMF can\u2019t see your files until you grant it again.',
      variant: 'danger'
    });
  } else if (!wasUsable && nowUsable) {
    uiStore.pushToast({ message: 'Storage access granted.', variant: 'success' });
  }
}
