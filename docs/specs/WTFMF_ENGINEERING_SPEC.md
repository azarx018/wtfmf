# WTFMF --- Engineering Specification

**Project:** Where The Fuck Is My File?\
**Platform:** Android\
**Purpose:** Private personal file intelligence, organization, and
cleanup utility\
**Distribution:** Personal use only\
**Cloud dependency:** None for core functionality\
**Accounts:** None\
**Monetization:** None

------------------------------------------------------------------------

# 1. Engineering Goals

WTFMF is a local-first Android application providing:

-   Storage analysis
-   File indexing
-   File search
-   File categorization
-   Duplicate detection
-   Large-file detection
-   Old-file detection
-   Virtual organization
-   Physical organization
-   Trash/recovery
-   Optional AI-assisted categorization

Priorities:

1.  File safety
2.  Privacy
3.  Offline operation
4.  Responsiveness
5.  Maintainability
6.  Clear UX

The filesystem is the ultimate source of truth for actual files.

SQLite is an index/cache of the filesystem, not a replacement for it.

------------------------------------------------------------------------

# 2. Technology Stack

## Frontend

-   Svelte
-   TypeScript
-   Vite
-   CSS variables/design tokens

SvelteKit may be used if routing requirements justify it, but the
Android app does not depend on SSR.

## Mobile

-   Capacitor
-   Native Android bridge written in Kotlin

## Database

-   SQLite

## Build

-   Gradle
-   Android SDK
-   GitHub Actions
-   APK artifact generation

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
Svelte UI
   ↓
Application Stores
   ↓
Use Cases
   ↓
Repositories / Services
   ↓
SQLite / Native Android
   ↓
Filesystem
```

UI components must never directly access SQLite or Android filesystem
APIs.

------------------------------------------------------------------------

# 4. State Management

Use **Svelte stores as the application-state layer**.

SQLite is authoritative for persistent domain data.

The filesystem is authoritative for actual file existence and file
content.

## 4.1 Source of Truth

  Data                         Source of truth
  ---------------------------- --------------------------------------
  Actual file existence        Filesystem
  File metadata index          SQLite
  Categories                   SQLite
  User organization rules      SQLite
  Trash records                SQLite + filesystem state
  Settings                     SQLite
  Current scan progress        scanStore/native scanner
  Current navigation           uiStore
  Current selection            UI/application store
  Temporary dialog state       Component/local state
  Derived storage statistics   SQLite queries + derived store state
  Permission state             Native Android + permissionStore

When SQLite and filesystem disagree, the filesystem wins.

The database must be reconciled rather than forcing the filesystem to
match stale database data.

------------------------------------------------------------------------

# 5. Stores

## `permissionStore`

Responsibilities:

-   Current permission state
-   Selected SAF roots
-   Permission refresh
-   Permission errors

States:

``` text
UNKNOWN
NONE
PARTIAL
FULL
REVOKED
```

## `scanStore`

Responsibilities:

-   Scan status
-   Progress
-   Current path
-   Files discovered
-   Errors
-   Cancellation
-   Resume state

States:

``` text
IDLE
RUNNING
PAUSED
CANCELLED
COMPLETED
FAILED
```

## `fileStore`

Responsibilities:

-   Paginated file results
-   Current filters
-   Search results
-   Selected files

It must never contain the complete filesystem index in memory.

## `categoryStore`

Responsibilities:

-   Category tree
-   File-category assignments
-   Category statistics
-   Category rules

## `cleanupStore`

Responsibilities:

-   Cleanup findings
-   Selected cleanup items
-   Estimated recoverable storage
-   Cleanup operation state

## `trashStore`

Responsibilities:

-   Trash contents
-   Restore operation
-   Permanent deletion state

## `settingsStore`

Responsibilities:

-   User settings
-   AI settings
-   Scan preferences
-   Protected paths
-   Cleanup preferences

## `uiStore`

Responsibilities:

-   Navigation
-   Active modal
-   Bottom sheets
-   Toasts
-   Global loading states

------------------------------------------------------------------------

# 6. Store Rules

Stores must not become a second database.

Do not store thousands of files permanently inside a Svelte store.

Use:

``` text
SQLite
  ↓
Repository query
  ↓
Store receives current page
  ↓
UI renders page
```

When a mutation occurs:

``` text
UI
 ↓
Use Case
 ↓
SQLite/filesystem mutation
 ↓
Repository returns result
 ↓
Store refreshes affected query
```

Avoid manually mutating multiple copies of the same data.

------------------------------------------------------------------------

# 7. Repository Layer

Required repositories:

``` text
FileRepository
CategoryRepository
ScanRepository
TrashRepository
SettingsRepository
OrganizationRuleRepository
DuplicateRepository
```

Repositories are responsible for persistence and queries.

Repositories must not contain UI logic.

------------------------------------------------------------------------

# 8. Service Layer

Required services:

``` text
ScannerService
CategorizationService
DuplicateService
CleanupService
FileOperationService
PermissionService
SearchService
AIClassifier
```

Services contain business logic.

Example:

``` text
Move selected files to Trash
        ↓
CleanupService
        ↓
FileOperationService
        ↓
StorageProvider
        ↓
Filesystem
        ↓
TrashRepository
```

------------------------------------------------------------------------

# 9. Storage Provider

Define a common interface:

``` text
StorageProvider

list(directory)
stat(uri)
exists(uri)
open(uri)
move(source, destination)
copy(source, destination)
rename(uri, name)
delete(uri)
createDirectory(uri, name)
```

Implement:

``` text
FullStorageProvider
SafStorageProvider
```

The application must not assume that every provider supports identical
operations.

------------------------------------------------------------------------

# 10. Permission Architecture

Do not request storage access before explaining its purpose.

Permission flow:

``` text
First launch
 ↓
Explain access
 ↓
User chooses:
   ├── Full access
   └── Selected folders
 ↓
Request Android permission
 ↓
Verify actual permission
 ↓
Initialize scanner
```

Permission must be revalidated when the application returns from Android
Settings.

------------------------------------------------------------------------

# 11. SQLite Schema

Initial schema:

``` sql
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
```

Indexes must be added for frequent queries:

``` sql
CREATE INDEX idx_files_size ON files(size);
CREATE INDEX idx_files_modified ON files(modified_at);
CREATE INDEX idx_files_extension ON files(extension);
CREATE INDEX idx_files_mime ON files(mime_type);
CREATE INDEX idx_files_scan ON files(scan_id);
CREATE INDEX idx_file_categories_category ON file_categories(category_id);
```

------------------------------------------------------------------------

# 12. Database Versioning

Use an explicit integer schema version.

Example:

``` text
DATABASE_VERSION = 1
```

Every schema change increments the version.

Migration sequence:

``` text
v1 → v2 → v3 → v4
```

Never jump directly from an old schema to the newest schema with
undocumented destructive changes.

Each migration must be:

-   deterministic
-   transactional
-   testable
-   logged
-   safe against partial execution

Example:

``` text
MigrationRunner
 ├── migration_001
 ├── migration_002
 ├── migration_003
 └── migration_004
```

The application must support users upgrading across multiple versions.

------------------------------------------------------------------------

# 13. Migration Failure

If migration fails:

1.  Stop normal database usage.
2.  Do not continue against a partially migrated schema.
3.  Preserve the previous database where possible.
4.  Roll back the transaction.
5.  Log the migration error locally.
6.  Show a user-readable recovery message.

Before risky migrations, create a database backup when practical.

------------------------------------------------------------------------

# 14. Scanner Architecture

Scanning is incremental.

## Pass 1 --- Metadata

Collect:

-   URI
-   path
-   filename
-   extension
-   MIME
-   size
-   modified time
-   directory state

## Pass 2 --- Aggregation

Calculate:

-   storage totals
-   category totals
-   folder totals
-   largest files

## Pass 3 --- Duplicate candidates

Candidate pipeline:

``` text
all files
 ↓
same size
 ↓
same extension/MIME
 ↓
partial hash
 ↓
full SHA-256
```

## Pass 4 --- Optional deep analysis

Examples:

-   PDF extraction
-   image metadata
-   APK metadata
-   AI classification

------------------------------------------------------------------------

# 15. Scanner Requirements

Scanner must:

-   run incrementally
-   persist completed metadata
-   support cancellation
-   support resume
-   survive application restart
-   avoid loading all files into memory
-   avoid blocking the UI

Progress should be persisted periodically.

------------------------------------------------------------------------

# 16. Scan Recovery

If the app is killed during scanning:

``` text
Previous scan interrupted.

1,824 files were indexed.

[ Continue Scan ]
[ Start New Scan ]
```

Completed records remain valid.

------------------------------------------------------------------------

# 17. File Consistency

The filesystem can change outside WTFMF.

Before file operations:

``` text
exists(uri)
```

must be checked.

If a file disappeared:

``` text
File no longer exists.

[ Remove From Index ]
[ Keep Record ]
```

The application must never recreate a missing file merely because SQLite
contains its old metadata.

------------------------------------------------------------------------

# 18. Categorization Engine

Three layers.

## Layer 1 --- Deterministic

Use:

-   extension
-   MIME
-   known Android paths

Examples:

``` text
jpg → Images
mp4 → Videos
apk → Applications
zip → Archives
pdf → Documents
```

## Layer 2 --- Local Rules

Use:

-   filename
-   folder
-   keywords
-   regex
-   user rules

Examples:

``` text
Screenshot_*.png
→ Images/Screenshots

certificate*.pdf
→ Education/Certificates

invoice*.pdf
→ Finance/Invoices
```

## Layer 3 --- Optional AI

Used only when local confidence is insufficient.

------------------------------------------------------------------------

# 19. Confidence

Internal confidence:

``` text
90–100%  Very high
75–89%   High
50–74%   Uncertain
<50%     Unknown
```

UI should generally use:

``` text
High confidence
Likely
Needs review
```

rather than exposing raw percentages everywhere.

------------------------------------------------------------------------

# 20. User Rules

Users can create rules:

``` text
IF filename contains "certificate"
AND extension = "pdf"
THEN category = Education/Certificates
```

Rules have:

-   priority
-   conditions
-   destination category
-   enabled state
-   timestamps

Rules are evaluated before AI.

------------------------------------------------------------------------

# 21. Virtual Organization

Virtual organization does not move the actual file.

Example:

``` text
/storage/Download/MTCNA.pdf
```

can appear under:

``` text
Education
└── Certificates
```

while physically remaining in:

``` text
Download/
```

This is the safest default organization method.

------------------------------------------------------------------------

# 22. Physical Organization

Physical moves require explicit confirmation.

Confirmation must show:

``` text
42 files
1.8 GB

From:
Download/

To:
Documents/Education/Certificates/
```

The operation must detect:

-   destination conflict
-   insufficient storage
-   permission loss
-   missing source
-   partial failure

Never silently overwrite.

------------------------------------------------------------------------

# 23. Trash

Preferred flow:

``` text
User selects files
 ↓
Review
 ↓
Move to Trash
 ↓
Restore or permanently delete
```

Trash records must retain original location where possible.

Permanent deletion requires explicit confirmation.

------------------------------------------------------------------------

# 24. Search

Search supports:

-   filename
-   extension
-   folder
-   category
-   size
-   modification date

Queries must be paginated.

Do not load the entire search result into memory.

------------------------------------------------------------------------

# 25. AI Privacy

AI is disabled by default.

Core WTFMF functionality must work without AI.

When AI is enabled, only minimum necessary information should be sent.

Default permitted payload:

``` text
filename
extension
MIME type
folder context
optional limited extracted text
```

Do not send the complete filesystem.

Do not upload files automatically.

------------------------------------------------------------------------

# 26. AI Consent

First use:

``` text
AI-assisted organization

Some files are difficult to classify locally.

If enabled, WTFMF may send limited metadata
and optionally extracted text to your selected AI provider.

Your files are not uploaded automatically.

[ Keep AI Off ]
[ Enable AI ]
```

The user must explicitly enable AI.

------------------------------------------------------------------------

# 27. AI Data Lifecycle

Preferred lifecycle:

``` text
File
 ↓
Temporary text extraction
 ↓
AI classification
 ↓
Category result
 ↓
Temporary text deleted
```

Persist only:

``` text
category
confidence
reason
timestamp
```

Do not permanently store extracted private document text by default.

------------------------------------------------------------------------

# 28. AI Provider Abstraction

Use:

``` text
AIClassifier
├── DisabledClassifier
├── RemoteAIClassifier
└── FutureLocalClassifier
```

AI failures must fall back to local classification.

Possible failures:

-   offline
-   timeout
-   rate limit
-   provider failure
-   malformed response

None should break core file management.

------------------------------------------------------------------------

# 29. Performance Budget

Targets are engineering goals and must be benchmarked on representative
mid-range Android hardware.

## Startup

Target:

``` text
cold launch → interactive ≤ 2 seconds
```

under normal conditions.

## Scanning

Benchmark:

``` text
1,000 files
5,000 files
10,000 files
50,000 files
```

Target:

``` text
10,000 files:
first useful results ≤ 3 seconds where storage performance allows
full metadata scan target ≤ 15 seconds
```

Do not block UI while scanning.

## UI

Target:

``` text
60 FPS
```

during normal list scrolling.

Use list virtualization.

------------------------------------------------------------------------

# 30. Memory Budget

Never load all indexed files into JavaScript.

Avoid:

``` sql
SELECT * FROM files;
```

for large datasets.

Use:

-   pagination
-   cursor queries
-   SQL aggregation
-   indexes
-   virtualization

Target rendered list:

``` text
≤ approximately 100 active rows
```

depending on viewport and implementation.

------------------------------------------------------------------------

# 31. Hashing

Hash only duplicate candidates.

Use staged hashing:

``` text
size
 ↓
MIME/extension
 ↓
partial hash
 ↓
full SHA-256
```

Hashing must run away from the main UI thread.

------------------------------------------------------------------------

# 32. Testing Strategy

## Unit tests

Test:

-   category rules
-   filename matching
-   confidence calculations
-   storage calculations
-   filters
-   duplicate candidate selection
-   organization rule matching

## Integration tests

Test:

-   SQLite repositories
-   scanner → database
-   category → database
-   trash → restore
-   physical move
-   permission state updates
-   migration runner

## Android tests

Test:

-   permission grant
-   permission revoke
-   SAF selection
-   file move
-   file deletion
-   restore
-   interrupted scan
-   large directory scan

## UI tests

Test:

-   first launch
-   permission screen
-   dashboard
-   scan progress
-   category review
-   duplicate review
-   cleanup confirmation
-   trash
-   empty states
-   error states

------------------------------------------------------------------------

# 33. Acceptance Test Format

Every important feature must have:

``` text
ID
Feature
Precondition
Action
Expected Result
Failure Condition
```

Example:

``` text
ID: DUP-001

Feature:
Duplicate detection

Precondition:
Two files contain identical bytes but have different names.

Action:
Run duplicate scan.

Expected Result:
Both files appear in one duplicate group.

Failure Condition:
They appear as unrelated files.
```

------------------------------------------------------------------------

# 34. Required Acceptance Tests

Minimum test coverage:

``` text
PERM-001 Permission explanation
PERM-002 Full permission grant
PERM-003 SAF folder selection
PERM-004 Permission revoked

SCAN-001 Initial scan
SCAN-002 Scan cancellation
SCAN-003 Scan resume
SCAN-004 Interrupted scan recovery
SCAN-005 File disappears during scan

CAT-001 Extension categorization
CAT-002 Filename categorization
CAT-003 Custom category
CAT-004 Custom rule
CAT-005 Low-confidence classification
CAT-006 AI disabled behavior

DUP-001 Duplicate detection
DUP-002 Duplicate false-positive prevention
DUP-003 Large duplicate set

MOVE-001 Physical move
MOVE-002 Destination conflict
MOVE-003 Missing source
MOVE-004 Insufficient storage

TRASH-001 Move to trash
TRASH-002 Restore
TRASH-003 Permanent delete
TRASH-004 Missing trash source

DB-001 Fresh installation
DB-002 v1 → v2 migration
DB-003 Multi-version upgrade
DB-004 Migration rollback/failure

SEARCH-001 Filename search
SEARCH-002 Category filtering
SEARCH-003 Size filtering
SEARCH-004 Date filtering

AI-001 AI disabled
AI-002 AI consent
AI-003 AI request failure
AI-004 Temporary extraction cleanup
AI-005 Local fallback
```

------------------------------------------------------------------------

# 35. Synthetic Test Dataset

Use a generated test tree:

``` text
WTFMF_TEST_DATA/
├── Images/
├── Screenshots/
├── Videos/
├── Documents/
├── Certificates/
├── Archives/
├── APKs/
├── Duplicates/
├── Unicode/
├── LongNames/
├── EmptyFolders/
└── BrokenReferences/
```

Include:

-   identical files with different names
-   zero-byte files
-   large files
-   Unicode filenames
-   spaces
-   emoji
-   long names
-   misleading extensions
-   nested folders
-   files removed during scanning

Never use real private documents for automated testing.

------------------------------------------------------------------------

# 36. Crash Recovery

Every long-running operation must have a persisted state.

Example:

``` text
scan_sessions.status
```

When the app restarts:

``` text
if previous_scan.status == RUNNING
    show recovery UI
```

Do not mark a scan complete until all required work is persisted.

------------------------------------------------------------------------

# 37. Personal-Use Constraints

WTFMF has no commercial business model.

Therefore do not implement:

-   accounts
-   subscriptions
-   advertisements
-   paywalls
-   feature gating
-   cloud sync
-   server-side profiles
-   billing
-   telemetry requirements

The architecture should remain local and simple.

------------------------------------------------------------------------

# 38. Privacy

Default:

``` text
Network access: unnecessary
Analytics: disabled
AI: disabled
Cloud sync: unavailable
```

The application should remain useful with airplane mode enabled.

No filenames, full paths, or file contents should be transmitted
externally by default.

------------------------------------------------------------------------

# 39. Visual Design Tokens

Use centralized tokens.

Example:

``` css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --touch-min: 44px;

  --button-height: 52px;
}
```

Colors must also be tokenized.

No arbitrary per-component colors.

------------------------------------------------------------------------

# 40. Visual QA

Each major screen must be checked for:

-   spacing
-   hierarchy
-   typography
-   contrast
-   touch targets
-   long filenames
-   empty state
-   loading state
-   error state
-   permission state
-   dark-mode consistency

Test on the target Android viewport.

------------------------------------------------------------------------

# 41. Required Screens

Minimum production screens:

``` text
01 Onboarding / Permission
02 Home
03 Categories
04 Category Detail
05 File Search
06 File Detail
07 Large Files
08 Old Files
09 Duplicate Finder
10 Duplicate Group
11 Cleanup Review
12 Organization Review
13 Rule Editor
14 Trash
15 Settings
16 AI Privacy Settings
17 Scan Progress
18 Error / Recovery states
```

------------------------------------------------------------------------

# 42. UI Data Flow Example

For duplicate scanning:

``` text
User
 ↓
Duplicate Screen
 ↓
duplicateStore.startScan()
 ↓
DuplicateService
 ↓
FileRepository.queryCandidates()
 ↓
Hashing Engine
 ↓
DuplicateRepository
 ↓
duplicateStore.refresh()
 ↓
UI
```

For moving to Trash:

``` text
User
 ↓
Cleanup Review
 ↓
cleanupStore.moveToTrash()
 ↓
CleanupService
 ↓
FileOperationService
 ↓
StorageProvider
 ↓
Filesystem
 ↓
TrashRepository
 ↓
SQLite
 ↓
UI refresh
```

------------------------------------------------------------------------

# 43. Error Model

Every service operation should return a structured result.

``` text
SUCCESS
PARTIAL_SUCCESS
FAILED
CANCELLED
```

Errors should contain:

``` text
code
message
recoverable
affectedItems
```

Example:

``` json
{
  "code": "SOURCE_NOT_FOUND",
  "message": "The file no longer exists.",
  "recoverable": true
}
```

UI converts technical errors into human-readable messages.

------------------------------------------------------------------------

# 44. Architecture Decision Records

Maintain ADRs:

``` text
ADR-001 State Management
ADR-002 SQLite as Persistent Index
ADR-003 Storage Provider Abstraction
ADR-004 Incremental Scanner
ADR-005 Duplicate Detection Pipeline
ADR-006 Categorization Engine
ADR-007 AI Privacy
ADR-008 SQLite Migration
ADR-009 Trash Architecture
ADR-010 Performance Strategy
```

Each ADR contains:

``` text
Context
Decision
Alternatives
Reason
Consequences
```

------------------------------------------------------------------------

# 45. Definition of Done

A feature is not complete when the happy path works.

It is complete only when it includes:

-   implementation
-   loading state
-   empty state
-   error state
-   permission state where relevant
-   cancellation where relevant
-   persistence where relevant
-   unit tests
-   integration tests where relevant
-   acceptance test
-   accessibility review
-   performance review
-   privacy review
-   visual QA

------------------------------------------------------------------------

# 46. Engineering North Star

WTFMF is not a generic file manager.

It is a:

> **Private, local-first intelligence layer for understanding and
> organizing an Android filesystem.**

The filesystem remains under the user's control.

The application should never sacrifice:

-   file safety
-   privacy
-   offline functionality
-   responsiveness

for unnecessary complexity.

The final experience should make a chaotic filesystem feel
understandable without making the user afraid that the application will
accidentally destroy their files.
