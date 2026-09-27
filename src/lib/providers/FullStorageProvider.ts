import type { DirectoryEntry, FileStat, ProviderCapabilities, StorageProvider } from './StorageProvider';

/**
 * Full-storage strategy — backed by MANAGE_EXTERNAL_STORAGE.
 *
 * ADR-012 #1 (resolved): targetSdk 34, minSdk 26. On API 34,
 * MANAGE_EXTERNAL_STORAGE must be requested via
 * `Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION` (a dedicated
 * settings screen, not a runtime dialog), and permission state must be
 * re-checked on `onResume`. WTFMF is sideloaded/personal-use, so Play
 * Store's extra restrictions on declaring this permission don't apply.
 */
export class FullStorageProvider implements StorageProvider {
  readonly capabilities: ProviderCapabilities = {
    canMove: true,
    canCopy: true,
    canRename: true,
    canDelete: true,
    canCreateDirectory: true
  };

  async list(_directoryUri: string): Promise<DirectoryEntry[]> {
    throw new Error('Not implemented — bridge to native Kotlin file listing');
  }

  async stat(_uri: string): Promise<FileStat | null> {
    throw new Error('Not implemented');
  }

  async exists(_uri: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async open(_uri: string): Promise<void> {
    throw new Error('Not implemented — delegate to ACTION_VIEW intent');
  }

  async move(_sourceUri: string, _destinationDirectoryUri: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async copy(_sourceUri: string, _destinationDirectoryUri: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async rename(_uri: string, _newName: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async delete(_uri: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async createDirectory(_parentUri: string, _name: string): Promise<string> {
    throw new Error('Not implemented');
  }
}
