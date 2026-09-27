import { App } from '@capacitor/app';
import { PermissionServiceImpl } from '$lib/services/impl/PermissionServiceImpl';
import { recheckPermissionOnResume } from '$lib/usecases/permissionFlow';
import type { SettingsRepository } from '$lib/repositories/SettingsRepository';

// TODO: replace with the real SQLite-backed implementation once
// src/lib/db/client.ts is wired up (see README "Before writing real
// service implementations").
const inMemorySettingsRepository: SettingsRepository = (() => {
  const values: Record<string, string> = {};
  return {
    async get(key) {
      return values[key] ?? null;
    },
    async set(key, value) {
      values[key] = value;
    },
    async getAll() {
      return { ...values };
    }
  };
})();

export const permissionService = new PermissionServiceImpl(inMemorySettingsRepository);

let listenerRegistered = false;

/**
 * Call once from the root layout's onMount. Registers the app-resume
 * listener that re-checks permission state (spec §10) — this is what
 * makes "user revokes access in Settings while WTFMF is backgrounded"
 * get caught instead of silently assumed away.
 */
export function initAppLifecycle(): void {
  if (listenerRegistered) return;
  listenerRegistered = true;

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      void recheckPermissionOnResume(permissionService);
    }
  });
}
