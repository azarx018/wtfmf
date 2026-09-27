import { describe, it, expect } from 'vitest';
import { toConfidenceLabel } from '$lib/types/category';

// Mirrors WTFMF_ENGINEERING_SPEC.md §19 confidence bands.
describe('toConfidenceLabel', () => {
  it('maps 90-100% to very_high', () => {
    expect(toConfidenceLabel(0.9)).toBe('very_high');
    expect(toConfidenceLabel(1.0)).toBe('very_high');
  });

  it('maps 75-89% to high', () => {
    expect(toConfidenceLabel(0.75)).toBe('high');
    expect(toConfidenceLabel(0.89)).toBe('high');
  });

  it('maps 50-74% to uncertain', () => {
    expect(toConfidenceLabel(0.5)).toBe('uncertain');
    expect(toConfidenceLabel(0.74)).toBe('uncertain');
  });

  it('maps below 50% to unknown', () => {
    expect(toConfidenceLabel(0.49)).toBe('unknown');
    expect(toConfidenceLabel(0)).toBe('unknown');
  });
});
