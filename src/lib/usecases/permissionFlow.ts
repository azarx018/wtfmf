import type { PermissionService } from '$lib/services/PermissionService';
import { permissionStore } from '$lib/stores/permissionStore';
import { uiStore } from '$lib/stores/uiStore';

/** Called once on app start / onboarding screen mount — never prompts anything by itself. */
export async function checkPermissionOnLoad(permissionService: PermissionService): Promise<void> {
  const snapshot = await permissionService.getCurrent();
  permissionStore.setSnapshot(snapshot);
}

/** "Manage All Files" button on the onboarding screen (UI/UX rules §25). */
export async function requestFullStorageAccess(permissionService: PermissionService): Promise<void> {
  const snapshot = await permissionService.requestFullAccess();
  permissionStore.setSnapshot(snapshot);
  if (snapshot.state !== 'FULL') {
    // User backed out of the Settings screen without granting — not an
    // error, just an incomplete grant. No toast; the onboarding screen's
    // own state reflects this.
    return;
  }
  uiStore.pushToast({ message: 'Full storage access granted.', variant: 'success' });
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
 * holds, e.g. user revoked it from Android Settings while backgrounded).
 * Wired up once in src/lib/bootstrap.ts.
 */
export async function recheckPermissionOnResume(permissionService: PermissionService): Promise<void> {
  const previous = await permissionService.getCurrent();
  const snapshot = await permissionService.refresh();
  permissionStore.setSnapshot(snapshot);

  if (previous.state !== 'NONE' && snapshot.state === 'NONE') {
    uiStore.pushToast({
      message: 'Storage access was revoked. WTFMF can\u2019t see your files until you grant it again.',
      variant: 'danger'
    });
  }
}
