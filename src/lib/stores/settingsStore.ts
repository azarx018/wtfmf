import { writable } from 'svelte/store';

// Mirrors the `settings` key/value table. Keep keys centralized here so
// the rest of the app doesn't hardcode string literals.
export const SETTINGS_KEYS = {
  AI_ENABLED: 'ai.enabled',
  AI_CONSENT_SHOWN: 'ai.consent_shown',
  SCAN_AUTO_BACKGROUND: 'scan.auto_background',
  CLEANUP_PROTECTED_PATHS: 'cleanup.protected_paths_json',
  TRASH_AUTO_DELETE_DAYS: 'trash.auto_delete_days'
} as const;

interface SettingsState {
  values: Record<string, string>;
  loaded: boolean;
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsState>({ values: {}, loaded: false });

  return {
    subscribe,
    hydrate: (values: Record<string, string>) => set({ values, loaded: true }),
    setValue: (key: string, value: string) =>
      update((s) => ({ ...s, values: { ...s.values, [key]: value } }))
  };
}

export const settingsStore = createSettingsStore();
