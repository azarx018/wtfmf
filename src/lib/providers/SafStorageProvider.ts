import type { DirectoryEntry, FileStat, ProviderCapabilities, StorageProvider } from './StorageProvider';

/**
 * SAF strategy — operates only within user-selected folder trees granted
 * via Android's Storage Access Framework (ACTION_OPEN_DOCUMENT_TREE).
 * Some operations (e.g. rename in place across providers) may be more
 * restricted than FullStorageProvider — always check `capabilities`.
 */
export class SafStorageProvider implements StorageProvider {
  constructor(private readonly grantedRoots: string[]) {}

  readonly capabilities: ProviderCapabilities = {
    canMove: true,
    canCopy: true,
    canRename: true,
    canDelete: true,
    canCreateDirectory: true
  };

  private assertWithinGrantedRoot(uri: string): void {
    const allowed = this.grantedRoots.some((root) => uri.startsWith(root));
    if (!allowed) {
      throw new Error(`URI is outside any SAF-granted root: ${uri}`);
    }
  }

  async list(directoryUri: string): Promise<DirectoryEntry[]> {
    this.assertWithinGrantedRoot(directoryUri);
    throw new Error('Not implemented — bridge to native SAF DocumentFile listing');
  }

  async stat(uri: string): Promise<FileStat | null> {
    this.assertWithinGrantedRoot(uri);
    throw new Error('Not implemented');
  }

  async exists(uri: string): Promise<boolean> {
    this.assertWithinGrantedRoot(uri);
    throw new Error('Not implemented');
  }

  async open(uri: string): Promise<void> {
    this.assertWithinGrantedRoot(uri);
    throw new Error('Not implemented');
  }

  async move(sourceUri: string, destinationDirectoryUri: string): Promise<string> {
    this.assertWithinGrantedRoot(sourceUri);
    this.assertWithinGrantedRoot(destinationDirectoryUri);
    throw new Error('Not implemented');
  }

  async copy(sourceUri: string, destinationDirectoryUri: string): Promise<string> {
    this.assertWithinGrantedRoot(sourceUri);
    this.assertWithinGrantedRoot(destinationDirectoryUri);
    throw new Error('Not implemented');
  }

  async rename(uri: string, _newName: string): Promise<string> {
    this.assertWithinGrantedRoot(uri);
    throw new Error('Not implemented');
  }

  async delete(uri: string): Promise<void> {
    this.assertWithinGrantedRoot(uri);
    throw new Error('Not implemented');
  }

  async createDirectory(parentUri: string, _name: string): Promise<string> {
    this.assertWithinGrantedRoot(parentUri);
    throw new Error('Not implemented');
  }
}
