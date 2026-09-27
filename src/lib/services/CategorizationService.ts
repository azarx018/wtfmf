import type { FileRecord } from '$lib/types/file';
import type { ClassificationSource } from '$lib/types/category';

export interface ClassificationResult {
  categoryPath: string; // e.g. "Education/Certificates"
  confidence: number; // 0..1
  source: ClassificationSource;
  reason: string;
}

// Layer 1 (deterministic) -> Layer 2 (local rules) -> Layer 3 (AI, optional).
// Rules are evaluated before AI (master prompt §5 / spec §20).
export interface CategorizationService {
  classify(file: FileRecord, options?: { allowAi?: boolean }): Promise<ClassificationResult>;
  classifyBatch(files: FileRecord[], options?: { allowAi?: boolean }): Promise<ClassificationResult[]>;
}
