import { App } from '@capacitor/app';
import { PermissionServiceImpl } from '$lib/services/impl/PermissionServiceImpl';
import { SettingsRepositoryImpl } from '$lib/repositories/impl/SettingsRepositoryImpl';
import { checkPermissionOnLoad, recheckPermissionOnResume } from '$lib/usecases/permissionFlow';

export const permissionService = new PermissionServiceImpl(new SettingsRepositoryImpl());

let listenerRegistered = false;

/**
 * Call once from the root layout's onMount. Runs the initial permission
 * check (so permissionStore is populated before any route decides
 * whether to redirect to onboarding — see +layout.svelte's guard) and
 * registers the app-resume listener that re-checks permission state
 * (spec §10) — this is what makes "user revokes access in Settings while
 * WTFMF is backgrounded" get caught instead of silently assumed away.
 */
export function initAppLifecycle(): void {
  if (listenerRegistered) return;
  listenerRegistered = true;

  void checkPermissionOnLoad(permissionService);

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      void recheckPermissionOnResume(permissionService);
    }
  });
}
