// WTFMF_ENGINEERING_SPEC.md §9 — Storage Provider
// The application must not assume every provider supports identical
// operations. Callers should check `capabilities` before calling an
// operation, and handle a NOT_SUPPORTED result gracefully.

export interface DirectoryEntry {
  uri: string;
  name: string;
  isDirectory: boolean;
}

export interface FileStat {
  uri: string;
  name: string;
  size: number;
  mimeType: string | null;
  modifiedAt: number | null;
  isDirectory: boolean;
}

export interface ProviderCapabilities {
  canMove: boolean;
  canCopy: boolean;
  canRename: boolean;
  canDelete: boolean;
  canCreateDirectory: boolean;
}

export interface StorageProvider {
  readonly capabilities: ProviderCapabilities;

  list(directoryUri: string): Promise<DirectoryEntry[]>;
  stat(uri: string): Promise<FileStat | null>;
  exists(uri: string): Promise<boolean>;
  open(uri: string): Promise<void>; // delegates to Android's ACTION_VIEW intent
  move(sourceUri: string, destinationDirectoryUri: string): Promise<string>; // returns new uri
  copy(sourceUri: string, destinationDirectoryUri: string): Promise<string>;
  rename(uri: string, newName: string): Promise<string>;
  delete(uri: string): Promise<void>;
  createDirectory(parentUri: string, name: string): Promise<string>;
}
