# WTFMF --- Master Prompt

## Product

**Where The Fuck Is My File? (WTFMF)**

WTFMF is a private, local-first Android application for finding,
understanding, categorizing, organizing, and safely cleaning personal
files.

This is a personal project.

There is:

-   no monetization
-   no subscription
-   no advertising
-   no account system
-   no SaaS backend
-   no required cloud sync
-   no analytics requirement

The product must work offline for all core functionality.

------------------------------------------------------------------------

# 1. Product Philosophy

The app exists to solve one problem:

> "My phone has thousands of files and I have no idea what's actually
> there."

WTFMF should answer:

-   Where is my storage going?
-   Where is that file?
-   What files are duplicates?
-   What files are huge?
-   What files are old?
-   What category does each file belong to?
-   How can I organize them safely?

The core product loop:

``` text
SCAN
 ↓
UNDERSTAND
 ↓
CATEGORIZE
 ↓
REVIEW
 ↓
ORGANIZE
 ↓
CLEAN
```

------------------------------------------------------------------------

# 2. Non-Negotiable Principles

## Local-first

Core operations happen on-device.

## Safe-by-default

Never silently:

-   delete
-   overwrite
-   move
-   upload

user files.

## Reversible cleanup

Prefer Trash before permanent deletion.

## User control

Suggestions must be reviewable.

## AI optional

The product must remain useful with AI disabled.

## No fake intelligence

Do not label something "safe to delete" merely because it is old, large,
duplicated, or unused.

------------------------------------------------------------------------

# 3. MVP

The MVP must include:

-   permission setup
-   storage scanner
-   storage dashboard
-   file indexing
-   file search
-   category detection
-   custom categories
-   custom categorization rules
-   virtual organization
-   physical organization
-   large files
-   old files
-   duplicate finder
-   cleanup review
-   Trash
-   restore
-   permanent delete
-   settings
-   privacy controls
-   polished dark UI

AI classification is not required for MVP.

------------------------------------------------------------------------

# 4. Categorization

Categorization uses three levels.

## Level 1

Deterministic:

-   extension
-   MIME
-   Android path conventions

## Level 2

Local intelligence:

-   filename
-   folder
-   keywords
-   regex
-   user rules

## Level 3

Optional AI:

-   only low-confidence files
-   only after user enables AI
-   minimal metadata
-   temporary extracted text only where necessary
-   no automatic full-file uploads

Example:

``` text
MTCNA-Certificate.pdf
→ Education > Certificates
```

The user may accept, modify, or ignore the suggestion.

------------------------------------------------------------------------

# 5. Virtual Organization

A file can be categorized without physically moving it.

Example:

``` text
/storage/emulated/0/Download/MTCNA.pdf
```

appears under:

``` text
Education
└── Certificates
```

but remains physically inside `Download`.

This is the safest organization mode.

------------------------------------------------------------------------

# 6. Physical Organization

Physical moves are optional.

Before moving:

``` text
42 files
1.8 GB

From:
Download/

To:
Documents/Education/Certificates/
```

Require explicit confirmation.

Handle conflicts safely.

Never silently overwrite.

------------------------------------------------------------------------

# 7. Storage Analysis

Dashboard must show:

-   used storage
-   free storage
-   total storage
-   category breakdown
-   largest categories
-   potential cleanup
-   recent discoveries

Primary question:

> "What is taking up my storage?"

------------------------------------------------------------------------

# 8. Duplicate Detection

Use:

``` text
same size
 ↓
same extension/MIME
 ↓
partial hash
 ↓
full SHA-256
```

Do not hash every file unnecessarily.

Show duplicate groups rather than a flat list.

------------------------------------------------------------------------

# 9. Cleanup

Potential findings:

-   duplicate files
-   large files
-   old APKs
-   old downloads
-   large recordings
-   empty folders

Use wording:

> Potentially removable

Never imply automatic safety.

Flow:

``` text
Findings
 ↓
Review
 ↓
Select
 ↓
Move to Trash
 ↓
Restore / Permanently Delete
```

------------------------------------------------------------------------

# 10. Permission UX

Explain why storage access is required before requesting it.

Support:

-   full storage access where appropriate
-   selected folders through SAF

Permission state must be rechecked after returning from Android
Settings.

------------------------------------------------------------------------

# 11. Search

Search:

-   filename
-   extension
-   folder
-   category
-   size
-   modified date

Use pagination/virtualization.

------------------------------------------------------------------------

# 12. AI

AI is OFF by default.

The user must explicitly enable it.

AI should only receive the minimum information required for
classification.

Preferred:

``` text
filename
extension
MIME
folder context
limited extracted text if necessary
```

Temporary extracted text should be deleted after classification unless
the user explicitly chooses otherwise.

AI failure must fall back to local classification.

------------------------------------------------------------------------

# 13. Privacy

No:

-   telemetry by default
-   cloud sync
-   automatic uploads
-   account
-   analytics
-   server-side file index

The app should remain functional with airplane mode enabled.

------------------------------------------------------------------------

# 14. Navigation

Primary navigation:

``` text
Home
Categories
Tools
More
```

Tools:

``` text
Duplicates
Large Files
Old Files
Search
```

Trash remains easily accessible.

------------------------------------------------------------------------

# 15. Home UX

Home should show:

``` text
Storage
91.4 / 128 GB
71%

Potential cleanup
14.7 GB

Quick actions
Analyze
Duplicates
Large Files
Old Files

What's taking space?
Videos
Images
Archives
Documents
```

Do not turn the home screen into an admin dashboard.

------------------------------------------------------------------------

# 16. Visual Direction

Personality:

-   premium
-   dark
-   technical
-   calm
-   slightly playful

Avoid:

-   generic Material dashboard
-   excessive glassmorphism
-   excessive neon
-   rainbow gradients
-   dense tables
-   childish meme UI
-   AI chatbot as the primary experience

Use:

-   deep navy/black background
-   subtle gradients
-   bright accent
-   rounded surfaces
-   strong typography
-   restrained motion

------------------------------------------------------------------------

# 17. UX Safety

Every potentially destructive operation must show:

-   what will happen
-   number of files
-   total size
-   destination
-   reversibility

Example:

> These 16 files will be moved to Trash.

Button:

**Move to Trash**

not:

**Continue**

Permanent deletion requires explicit confirmation.

------------------------------------------------------------------------

# 18. Performance

The application must:

-   scan incrementally
-   avoid loading all files into memory
-   virtualize large lists
-   hash selectively
-   run long operations outside the UI thread
-   support cancellation
-   persist scan progress

Engineering targets:

``` text
Cold launch → interactive: ≤ 2 seconds
10,000-file initial useful results: ≤ 3 seconds where hardware allows
10,000-file metadata scan: target ≤ 15 seconds
Normal list scrolling: target 60 FPS
```

Benchmarks must be performed on representative Android hardware.

------------------------------------------------------------------------

# 19. Database

Use SQLite.

Persistent domain state:

``` text
files
categories
file_categories
organization_rules
scan_sessions
duplicate_groups
duplicate_members
trash_items
settings
```

Use migrations with explicit schema versions.

Never destroy data during an app update.

------------------------------------------------------------------------

# 20. State Management

Use Svelte stores as the application-state layer.

SQLite is authoritative for persistent domain data.

Filesystem is authoritative for actual files.

Suggested stores:

``` text
permissionStore
scanStore
fileStore
categoryStore
cleanupStore
trashStore
settingsStore
uiStore
```

Do not keep the entire file index inside Svelte stores.

------------------------------------------------------------------------

# 21. Architecture

``` text
UI
 ↓
Stores
 ↓
Use Cases
 ↓
Services / Repositories
 ↓
SQLite / Storage Provider
 ↓
Filesystem
```

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

------------------------------------------------------------------------

# 22. Testing

Use:

-   unit tests
-   integration tests
-   Android/device tests
-   UI tests

Test:

-   permission grant/revoke
-   scanning
-   cancellation
-   resume
-   interrupted scan
-   categorization
-   rules
-   duplicates
-   physical moves
-   conflicts
-   Trash
-   restore
-   permanent delete
-   migrations
-   AI privacy
-   offline operation

Acceptance tests must use:

``` text
ID
Feature
Precondition
Action
Expected Result
Failure Condition
```

------------------------------------------------------------------------

# 23. Test Dataset

Maintain a synthetic dataset:

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

Include unusual filenames, duplicates, zero-byte files, large files, and
disappearing files.

Never use real private files in automated testing.

------------------------------------------------------------------------

# 24. Crash Recovery

Persist scan sessions.

States:

``` text
IDLE
RUNNING
PAUSED
CANCELLED
COMPLETED
FAILED
```

If Android kills the app during scanning:

``` text
Previous scan interrupted.

[ Continue Scan ]
[ Start New Scan ]
```

Completed records remain available.

------------------------------------------------------------------------

# 25. Definition of Done

A feature is complete only when it has:

-   implementation
-   loading state
-   empty state
-   error state
-   permission handling where relevant
-   persistence where relevant
-   tests
-   acceptance test
-   accessibility review
-   performance review
-   privacy review
-   visual QA

------------------------------------------------------------------------

# 26. Personal-Use Constraint

Do not introduce commercial infrastructure.

Do not add:

-   accounts
-   subscriptions
-   advertisements
-   premium tiers
-   paywalls
-   cloud sync
-   server authentication
-   billing

The application is a private Android utility.

------------------------------------------------------------------------

# 27. Product North Star

WTFMF should feel like:

> **A calm, intelligent control center for a chaotic phone.**

The user should open it and immediately understand:

-   what is taking space
-   where their files are
-   how files are categorized
-   what can potentially be cleaned
-   what the app is about to do

without ever feeling that the application might unexpectedly destroy or
expose their files.
