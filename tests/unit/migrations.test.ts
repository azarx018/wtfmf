import { describe, it, expect } from 'vitest';
import { MIGRATIONS, DATABASE_VERSION } from '$lib/db/migrationRunner';

// Regression guard: this project has had more than one "wiring looked
// right but silently didn't work" bug (wrong import path, wrong file
// extension assumed, etc.) that only showed up on a real device build.
// This test catches the equivalent mistake for the migration SQL import
// without needing a device at all.
describe('migration registry', () => {
  it('registers migration 001 with the initial schema SQL', () => {
    expect(MIGRATIONS).toHaveLength(1);
    expect(MIGRATIONS[0].version).toBe(1);
    expect(MIGRATIONS[0].sql).toContain('CREATE TABLE files');
    expect(MIGRATIONS[0].sql).toContain('CREATE TABLE settings');
  });

  it('computes DATABASE_VERSION as the highest registered version', () => {
    expect(DATABASE_VERSION).toBe(1);
  });
});
