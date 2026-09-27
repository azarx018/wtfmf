-- WTFMF SQLite schema
-- Source of truth: WTFMF_ENGINEERING_SPEC.md §11
-- This file is the CURRENT schema for a fresh install.
-- Upgrading installs run through migrations/ (see migrationRunner.ts) —
-- never edit this file to "fix" an already-released schema; add a migration.

CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    uri TEXT NOT NULL UNIQUE,
    path TEXT,
    name TEXT NOT NULL,
    extension TEXT,
    mime_type TEXT,
    size INTEGER NOT NULL DEFAULT 0,
    modified_at INTEGER,
    created_at INTEGER,
    hash TEXT,
    hash_status TEXT NOT NULL DEFAULT 'none',
    is_directory INTEGER NOT NULL DEFAULT 0,
    scan_id INTEGER
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER,
    name TEXT NOT NULL,
    icon TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(parent_id) REFERENCES categories(id)
);

CREATE TABLE file_categories (
    file_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    confidence REAL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY(file_id, category_id),
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE organization_rules (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    conditions_json TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE scan_sessions (
    id INTEGER PRIMARY KEY,
    status TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    files_discovered INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE trash_items (
    id INTEGER PRIMARY KEY,
    file_id INTEGER,
    original_uri TEXT NOT NULL,
    trash_uri TEXT,
    size INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER NOT NULL,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE SET NULL
);

CREATE TABLE duplicate_groups (
    id INTEGER PRIMARY KEY,
    size INTEGER NOT NULL,
    hash TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE duplicate_members (
    group_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    PRIMARY KEY(group_id, file_id),
    FOREIGN KEY(group_id) REFERENCES duplicate_groups(id) ON DELETE CASCADE,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX idx_files_size ON files(size);
CREATE INDEX idx_files_modified ON files(modified_at);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_mime ON files(mime_type);
CREATE INDEX idx_files_scan ON files(scan_id);
CREATE INDEX idx_file_categories_category ON file_categories(category_id);
