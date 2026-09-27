import type { PermissionSnapshot, StorageStrategy } from '$lib/types/permission';

// Must be re-checked whenever the app resumes from Android Settings
// (spec §10) — never assume a previously granted permission still holds.
export interface PermissionService {
  getCurrent(): Promise<PermissionSnapshot>;
  requestFullAccess(): Promise<PermissionSnapshot>;
  requestSafFolders(): Promise<PermissionSnapshot>;
  refresh(): Promise<PermissionSnapshot>; // call on app resume
  currentStrategy(): StorageStrategy | null;
}
