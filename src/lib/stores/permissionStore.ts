import { writable, derived } from 'svelte/store';
import type { PermissionSnapshot } from '$lib/types/permission';

function createPermissionStore() {
  const { subscribe, set, update } = writable<PermissionSnapshot>({
    state: 'UNKNOWN',
    strategy: null,
    safRoots: [],
    lastCheckedAt: 0
  });

  return {
    subscribe,
    set,
    // Called from PermissionService after any check/request; store never
    // computes permission state itself, it only reflects the last known one.
    setSnapshot: (snapshot: PermissionSnapshot) => set(snapshot),
    reset: () => set({ state: 'UNKNOWN', strategy: null, safRoots: [], lastCheckedAt: 0 })
  };
}

export const permissionStore = createPermissionStore();
export const hasUsableAccess = derived(
  permissionStore,
  ($p) => $p.state === 'FULL' || $p.state === 'PARTIAL'
);
