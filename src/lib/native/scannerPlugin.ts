import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';

// Mirrors native/android-plugin-reference/WtfmfScannerPlugin.java
// method-for-method. Event-based rather than one giant resolved promise:
// a scan can touch 10k+ files, so results stream in as batches instead
// of blocking until everything is done (spec §16/§24).

export interface NativeFileEntry {
  uri: string;
  path: string;
  name: string;
  extension: string | null;
  mimeType: string | null;
  size: number;
  modifiedAt: number | null;
  isDirectory: boolean;
}

export interface ScanBatchEvent {
  files: NativeFileEntry[];
  filesProcessed: number;
  currentPath: string | null;
}

export interface ScanCompleteEvent {
  filesProcessed: number;
  cancelled: boolean;
}

export interface ScanErrorEvent {
  message: string;
}

export interface WtfmfScannerPlugin {
  startScan(): Promise<{ started: boolean }>;
  cancelScan(): Promise<{ cancelled: boolean }>;
  addListener(
    eventName: 'scanBatch',
    listenerFunc: (event: ScanBatchEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'scanComplete',
    listenerFunc: (event: ScanCompleteEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'scanError',
    listenerFunc: (event: ScanErrorEvent) => void
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const WtfmfScanner = registerPlugin<WtfmfScannerPlugin>('WtfmfScanner');
