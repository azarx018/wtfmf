import type { PermissionService } from '$lib/services/PermissionService';
import type { PermissionSnapshot, StorageStrategy, PartialAccessSource } from '$lib/types/permission';
import type { SettingsRepository } from '$lib/repositories/SettingsRepository';
import { WtfmfPermission, type NativePermissionSnapshot, type NativePermissionState } from '$lib/native/permissionPlugin';

const SETTINGS_KEY_STRATEGY = 'permission.strategy';

function toSnapshot(native: NativePermissionSnapshot, strategy: StorageStrategy | null): PermissionSnapshot {
  const state = mapState(native.state);
  const partialSource = mapPartialSource(native.state);

  return {
    state,
    strategy,
    safRoots: native.safRoots,
    ...(partialSource ? { partialSource } : {}),
    lastCheckedAt: Date.now()
  };
}

export function mapState(nativeState: NativePermissionState): PermissionSnapshot['state'] {
  switch (nativeState) {
    case 'FULL':
      return 'FULL';
    case 'PARTIAL_SAF':
    case 'PARTIAL_MEDIA_SELECTED':
      return 'PARTIAL';
    case 'NONE':
      return 'NONE';
  }
}

export function mapPartialSource(nativeState: NativePermissionState): PartialAccessSource | undefined {
  if (nativeState === 'PARTIAL_SAF') return 'PARTIAL_SAF';
  if (nativeState === 'PARTIAL_MEDIA_SELECTED') return 'PARTIAL_MEDIA_SELECTED';
  return undefined;
}

export function strategyForNativeState(nativeState: NativePermissionState): StorageStrategy | null {
  if (nativeState === 'FULL') return 'full';
  if (nativeState === 'PARTIAL_SAF') return 'saf';
  return null; // NONE, or media-selected-only (not a StorageProvider strategy on its own)
}

export class PermissionServiceImpl implements PermissionService {
  private lastStrategy: StorageStrategy | null = null;

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getCurrent(): Promise<PermissionSnapshot> {
    return this.refresh();
  }

  async refresh(): Promise<PermissionSnapshot> {
    const native = await WtfmfPermission.checkState();
    const strategy = strategyForNativeState(native.state);
    this.lastStrategy = strategy;
    if (strategy) {
      await this.settingsRepository.set(SETTINGS_KEY_STRATEGY, strategy);
    }
    return toSnapshot(native, strategy);
  }

  async requestFullAccess(): Promise<PermissionSnapshot> {
    const native = await WtfmfPermission.requestFullAccess();
    this.lastStrategy = strategyForNativeState(native.state);
    if (this.lastStrategy) {
      await this.settingsRepository.set(SETTINGS_KEY_STRATEGY, this.lastStrategy);
    }
    return toSnapshot(native, this.lastStrategy);
  }

  async requestSafFolders(): Promise<PermissionSnapshot> {
    const native = await WtfmfPermission.requestSafFolder();
    this.lastStrategy = strategyForNativeState(native.state);
    if (this.lastStrategy) {
      await this.settingsRepository.set(SETTINGS_KEY_STRATEGY, this.lastStrategy);
    }
    return toSnapshot(native, this.lastStrategy);
  }

  currentStrategy(): StorageStrategy | null {
    return this.lastStrategy;
  }
}
