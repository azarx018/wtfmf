import { describe, it, expect } from 'vitest';
import { mapState, mapPartialSource, strategyForNativeState } from '$lib/services/impl/PermissionServiceImpl';

// ADR-012 #1 — verifies the FULL / PARTIAL_SAF / PARTIAL_MEDIA_SELECTED / NONE
// mapping from the native plugin's 4-state model onto the domain's
// PermissionState + optional partialSource.
describe('permission state mapping', () => {
  it('maps FULL to state FULL with no partial source', () => {
    expect(mapState('FULL')).toBe('FULL');
    expect(mapPartialSource('FULL')).toBeUndefined();
    expect(strategyForNativeState('FULL')).toBe('full');
  });

  it('maps PARTIAL_SAF to state PARTIAL with source PARTIAL_SAF', () => {
    expect(mapState('PARTIAL_SAF')).toBe('PARTIAL');
    expect(mapPartialSource('PARTIAL_SAF')).toBe('PARTIAL_SAF');
    expect(strategyForNativeState('PARTIAL_SAF')).toBe('saf');
  });

  it('maps PARTIAL_MEDIA_SELECTED to state PARTIAL with source PARTIAL_MEDIA_SELECTED', () => {
    expect(mapState('PARTIAL_MEDIA_SELECTED')).toBe('PARTIAL');
    expect(mapPartialSource('PARTIAL_MEDIA_SELECTED')).toBe('PARTIAL_MEDIA_SELECTED');
    // Photo-Picker-only access isn't a full StorageProvider strategy on its own.
    expect(strategyForNativeState('PARTIAL_MEDIA_SELECTED')).toBeNull();
  });

  it('maps NONE to state NONE with no strategy', () => {
    expect(mapState('NONE')).toBe('NONE');
    expect(mapPartialSource('NONE')).toBeUndefined();
    expect(strategyForNativeState('NONE')).toBeNull();
  });
});
