export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  icon: string | null;
  createdAt: number;
}

export type ClassificationSource = 'deterministic' | 'local_rule' | 'ai' | 'manual';

export interface FileCategoryAssignment {
  fileId: number;
  categoryId: number;
  source: ClassificationSource;
  confidence: number | null; // 0..1, null for manual assignments
  createdAt: number;
}

// Human-readable confidence bands — WTFMF_ENGINEERING_SPEC.md §19
export type ConfidenceLabel = 'very_high' | 'high' | 'uncertain' | 'unknown';

export function toConfidenceLabel(confidence: number): ConfidenceLabel {
  if (confidence >= 0.9) return 'very_high';
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.5) return 'uncertain';
  return 'unknown';
}
