export type PermissionState = 'UNKNOWN' | 'NONE' | 'PARTIAL' | 'FULL' | 'REVOKED';

export type StorageStrategy = 'full' | 'saf';

// ADR-012 #1 — when `state === 'PARTIAL'`, the UI needs to know which
// flow granted the partial access, because the recovery action differs:
// PARTIAL_SAF -> re-open/re-pick SAF folder
// PARTIAL_MEDIA_SELECTED -> re-open Photo Picker (Android 14 READ_MEDIA_VISUAL_USER_SELECTED)
export type PartialAccessSource = 'PARTIAL_SAF' | 'PARTIAL_MEDIA_SELECTED';

export interface PermissionSnapshot {
  state: PermissionState;
  strategy: StorageStrategy | null;
  safRoots: string[]; // SAF-granted root URIs, when strategy === 'saf'
  partialSource?: PartialAccessSource; // meaningful only when state === 'PARTIAL'
  lastCheckedAt: number;
}
