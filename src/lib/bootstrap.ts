import { App } from '@capacitor/app';
import { PermissionServiceImpl } from '$lib/services/impl/PermissionServiceImpl';
import { SettingsRepositoryImpl } from '$lib/repositories/impl/SettingsRepositoryImpl';
import { FileRepositoryImpl } from '$lib/repositories/impl/FileRepositoryImpl';
import { ScanRepositoryImpl } from '$lib/repositories/impl/ScanRepositoryImpl';
import { ScannerServiceImpl } from '$lib/services/impl/ScannerServiceImpl';
import { checkPermissionOnLoad, recheckPermissionOnResume } from '$lib/usecases/permissionFlow';

export const permissionService = new PermissionServiceImpl(new SettingsRepositoryImpl());
export const fileRepository = new FileRepositoryImpl();
export const scanRepository = new ScanRepositoryImpl();
export const scannerService = new ScannerServiceImpl(fileRepository, scanRepository);

let listenerRegistered = false;

/**
 * Call once from the root layout's onMount. Runs the initial permission
 * check (so permissionStore is populated before any route decides
 * whether to redirect to onboarding — see +layout.svelte's guard) and
 * registers resume-detection listeners that re-check permission state
 * (spec §10) — this is what makes "user grants/revokes access while
 * WTFMF is backgrounded" get caught instead of silently assumed away.
 *
 * Found on-device: a background-and-return (user goes to Settings,
 * grants All Files Access, presses back — without the app process ever
 * being killed) did NOT pick up the change via 'appStateChange' alone,
 * while a full kill-and-relaunch did (that path goes through
 * checkPermissionOnLoad above, not this listener). 'appStateChange' is
 * known to be unreliable on some Android OEM builds (MIUI/HyperOS
 * included) — rather than chase the exact cause blind, this registers
 * three independent resume signals, all calling the same idempotent
 * recheckPermissionOnResume, so the one that actually fires on this
 * device/ROM is enough:
 *   1. Capacitor's 'appStateChange' (isActive transition)
 *   2. Capacitor's simpler Android 'resume' event
 *   3. The DOM's own 'visibilitychange' — doesn't go through the native
 *      bridge at all, so it's a genuinely different mechanism, not just
 *      a second listener on the same underlying signal
 */
let debounceHandle: ReturnType<typeof setTimeout> | null = null;

/** Collapses near-simultaneous triggers (all three listeners can fire within milliseconds of each other) into a single recheck call, so the person doesn't see a duplicated toast. */
function triggerRecheck(): void {
  if (debounceHandle !== null) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    debounceHandle = null;
    void recheckPermissionOnResume(permissionService);
  }, 150);
}

export function initAppLifecycle(): void {
  if (listenerRegistered) return;
  listenerRegistered = true;

  void checkPermissionOnLoad(permissionService);

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) triggerRecheck();
  });

  App.addListener('resume', () => {
    triggerRecheck();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') triggerRecheck();
  });
}
