import type { FileRecord } from '$lib/types/file';
import type { ClassificationResult } from './CategorizationService';

// AI is off by default and must never be the only path to a working app
// (spec §25–28). Implementations: DisabledClassifier (default),
// RemoteAIClassifier, FutureLocalClassifier — all behind this interface.
export interface AIClassifierPayload {
  filename: string;
  path: string;
  mimeType: string | null;
  folderContext: string;
  extractedText?: string; // optional, temporary — never persisted (spec §27)
}

export interface AIClassifier {
  isEnabled(): boolean;
  classify(file: FileRecord, payload: AIClassifierPayload): Promise<ClassificationResult | null>; // null = fall back to local
}
