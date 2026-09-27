import { registerPlugin } from '@capacitor/core';

// Mirrors native/android-plugin-reference/WtfmfPermissionPlugin.kt method-for-method.
// This is the ONLY file allowed to call registerPlugin for permissions —
// PermissionServiceImpl depends on this, nothing else should import it directly.

export type NativePermissionState = 'NONE' | 'PARTIAL_SAF' | 'PARTIAL_MEDIA_SELECTED' | 'FULL';

export interface NativePermissionSnapshot {
  state: NativePermissionState;
  safRoots: string[]; // persisted SAF root URIs, if any
}

export interface WtfmfPermissionPlugin {
  /** Reads current permission state without prompting anything (spec §10: safe to call on every resume). */
  checkState(): Promise<NativePermissionSnapshot>;

  /** Launches Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION (ADR-012 §1). Resolves once the user returns. */
  requestFullAccess(): Promise<NativePermissionSnapshot>;

  /** Launches ACTION_OPEN_DOCUMENT_TREE and persists the granted URI permission. */
  requestSafFolder(): Promise<NativePermissionSnapshot>;
}

export const WtfmfPermission = registerPlugin<WtfmfPermissionPlugin>('WtfmfPermission');
