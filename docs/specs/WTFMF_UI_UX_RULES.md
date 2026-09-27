# WTFMF --- UI/UX Rules

## 1. Design Goal

WTFMF must feel like a **premium storage intelligence app**, not a
traditional Android file manager.

The visual experience should communicate:

-   clarity
-   control
-   safety
-   intelligence
-   speed
-   personality

The interface should feel polished enough to be a standalone consumer
product.

------------------------------------------------------------------------

# 2. Brand Personality

### Primary personality

**Premium + technical + playful**

Not: - corporate - childish - hacker-themed - overly futuristic -
generic Material Design

The profanity in the brand name is part of the personality, not the
entire personality.

Use it occasionally for memorable copy.

Examples:

-   "Where the fuck is my storage going?"
-   "Found 8.7 GB of nonsense."
-   "Your Downloads folder needs therapy."
-   "Okay, that's a lot of screenshots."

Do not use profanity in every screen.

------------------------------------------------------------------------

# 3. Visual Language

## Background

Use a very dark navy/blue-black base rather than pure black.

Recommended conceptual palette:

``` text
Background
#050A14 / #07111F

Surface
#0B1626

Elevated Surface
#101E31

Primary Accent
Electric blue → violet

Secondary Accent
Cyan

Positive
Green

Warning
Amber

Danger
Red

Muted text
Blue-gray
```

Do not hard-code the exact colors if the design system later changes.
Treat these as visual direction.

------------------------------------------------------------------------

# 4. Gradients

Gradients should be subtle and purposeful.

Good uses: - primary CTA - storage progress - hero illustration -
selected states - special AI elements

Bad uses: - every card - every icon - every background - every button

A gradient should communicate hierarchy, not decoration.

------------------------------------------------------------------------

# 5. Typography

Use a modern, highly readable sans-serif.

Hierarchy:

``` text
Display
32–40 px

Page title
24–28 px

Section title
18–20 px

Body
14–16 px

Secondary
12–14 px

Micro label
10–12 px
```

Never make important information tiny just to fit more content.

------------------------------------------------------------------------

# 6. Spacing

Use a consistent 4/8-based spacing system.

Common spacing:

``` text
4
8
12
16
20
24
32
40
48
```

Screens should breathe.

Avoid packing five cards into the space where two strong cards would be
clearer.

------------------------------------------------------------------------

# 7. Corner Radius

Use a consistent rounded language.

Suggested:

``` text
Large card       20–24
Medium card      16–20
Button           14–18
Chip             999
Input            14–18
```

Do not make every element excessively rounded.

------------------------------------------------------------------------

# 8. Shadows and Glass

Use subtle elevation.

Cards can have: - soft shadow - thin border - subtle translucent surface

Avoid heavy glassmorphism.

The app should still look good if blur/transparency is disabled.

------------------------------------------------------------------------

# 9. Home Screen

The Home screen is the most important screen.

It must answer:

1.  How much storage is used?
2.  What is taking space?
3.  What should I investigate?

Suggested structure:

``` text
WTFMF                                  ⚙

Your storage
┌────────────────────────────────────┐
│              71%                   │
│          91.4 / 128 GB             │
│      ━━━━━━━━━━━━━━━━━━━            │
│                                    │
│  36.6 GB free                      │
└────────────────────────────────────┘

Potential cleanup
┌────────────────────────────────────┐
│ ⚠ 14.7 GB                         ›│
│    potentially removable            │
└────────────────────────────────────┘

Quick actions

[ Analyze ] [ Duplicates ]
[ Large ]   [ Old files ]

What's taking space?

Videos       32.8 GB
Images       18.2 GB
Archives      7.4 GB
```

Do not put every feature on the home screen.

------------------------------------------------------------------------

# 10. Storage Visualization

The main storage visualization should be visually interesting but easy
to understand.

Use: - ring chart - segmented bar - category list

Do not rely on a chart alone.

Always pair the chart with: - category name - size - percentage

Example:

``` text
        71%
    91.4 GB

Videos       32.8 GB   35.8%
Images       18.2 GB   19.9%
Archives      7.4 GB    8.1%
```

------------------------------------------------------------------------

# 11. Category Screen

Categories should feel like a visual library.

Prefer:

``` text
┌──────────────┐ ┌──────────────┐
│ 🖼 Images    │ │ 🎬 Videos    │
│ 18.2 GB      │ │ 32.8 GB      │
│ 4,231 files  │ │ 1,092 files  │
└──────────────┘ └──────────────┘
```

over a boring vertical table.

Each category needs: - icon - name - size - count - optional percentage

------------------------------------------------------------------------

# 12. File Lists

File lists should prioritize scanning.

Each row:

``` text
[icon/thumb]  filename.ext
              folder • date
              size
```

Do not show huge metadata blocks in every row.

Use secondary information only when useful.

------------------------------------------------------------------------

# 13. File Details

A file details screen should feel calm and trustworthy.

Example:

``` text
video.mp4

/storage/emulated/0/Movies/

1.2 GB
12 Aug 2025
12:48 duration
1920 × 1080
video/mp4

──────────────

Open
Share
Move to Trash
```

The destructive action should visually stand apart.

------------------------------------------------------------------------

# 14. Duplicate Finder

Duplicate Finder should communicate groups, not individual chaos.

Example:

``` text
Group #01
4.8 MB × 3

[thumbnail] IMG_20260921.jpg
[thumbnail] IMG_20260921 (1).jpg
[thumbnail] WhatsApp Image...

[ Compare ] [ Keep 1 ] [ Ignore ]
```

Important:

-   Never auto-select files for deletion without clear explanation.
-   Make the original/selected file obvious.
-   Allow side-by-side comparison for images where practical.
-   Show total recoverable space.

------------------------------------------------------------------------

# 15. Cleanup Screen

Use the phrase:

**Potentially removable**

not:

**Safe to delete**

Visual hierarchy:

``` text
⚠ Potential cleanup
11.1 GB

Old APKs             2.4 GB
Duplicates           1.2 GB
Large recordings     5.7 GB
Old downloads        1.8 GB

[ Review Cleanup ]
```

The CTA should not immediately delete anything.

------------------------------------------------------------------------

# 16. Cleanup Confirmation

Confirmation must be explicit.

Example:

``` text
Review cleanup

Selected
5.4 GB
16 items

✓ Old APKs       2.4 GB
✓ Duplicates     1.2 GB
✓ Old downloads  1.8 GB

These files will be moved to Trash.

[ Move to Trash ]

Cancel
```

Never use ambiguous buttons like:

-   "Okay"
-   "Continue"
-   "Do it"

Use the exact operation:

**Move to Trash**

------------------------------------------------------------------------

# 17. Trash

Trash should feel reassuring rather than dangerous.

Show:

``` text
🗑 Trash

14 files
2.8 GB

Auto-delete in 27 days
```

Actions:

-   Restore
-   Delete Permanently

Permanent deletion must use stronger visual emphasis and a confirmation
step.

------------------------------------------------------------------------

# 18. Categorization UX

Categorization is a major feature.

After a scan:

``` text
We found your files.

12,482 files
67.3 GB

Suggested organization

Documents       1,842
Images          4,231
Videos          1,092
Archives          327
APKs              182
Other           3,857

[ Review Suggestions ]
```

Never silently move files.

------------------------------------------------------------------------

# 19. Categorization Review

Show the proposed result before applying it.

Example:

``` text
Suggested

MTCNA-Certificate.pdf

Education
  └ Certificates

94% match

Based on filename + document content

[ Accept ]
[ Change ]
[ Ignore ]
```

For batches:

``` text
42 files → Education/Certificates

[ Review ]
```

------------------------------------------------------------------------

# 20. Virtual vs Physical Organization

Always distinguish:

### Virtual organization

``` text
Categorized as:
Education > Certificates

Original location remains unchanged.
```

### Physical organization

``` text
Move to:
Documents/Education/Certificates

42 files
1.8 GB
```

The UI must explain the difference before execution.

------------------------------------------------------------------------

# 21. AI UX

AI must never feel mandatory.

Use a subtle label:

**AI-assisted**

or:

**AI suggestion**

Example:

``` text
AI suggestion

Invoice_0926.pdf
→ Finance > Invoices

Confidence: High

[ Apply ]
[ Change ]
```

Do not make AI the visual center of the entire application.

The core product should still feel intelligent without AI.

------------------------------------------------------------------------

# 22. Search UX

Search should be fast and prominent.

Search field:

``` text
⌕ Search files, folders, categories...
```

Support filters:

``` text
All
Files
Folders
Categories
Content
```

Advanced filters can appear as a bottom sheet.

Example:

``` text
Size
○ Any
○ >100 MB
○ >1 GB

Modified
○ Any
○ Last 7 days
○ Last 30 days
○ Older than 1 year
```

------------------------------------------------------------------------

# 23. Empty States

Never show blank screens.

Examples:

### No duplicates

> Nice. No duplicate groups found.

### No large files

> Nothing suspiciously huge here.

### No trash

> Trash is empty. Your storage is breathing.

### No categories

> Scan your storage to start organizing.

Every empty state should have: - short explanation - visual - relevant
CTA if applicable

------------------------------------------------------------------------

# 24. Loading States

Never show a generic spinner for long scans.

Use progress.

Example:

``` text
Scanning storage...

4,821 / 12,482 files

████████████░░░░░

Analyzing:
Download/

Found so far:
1.8 GB duplicates
6 large files
42 screenshots
```

Allow:

**Pause**

and:

**Cancel**

where technically supported.

------------------------------------------------------------------------

# 25. Permission UX

Permission screens must explain value before requesting access.

Bad:

> Allow permission?

Good:

> To analyze your storage, WTFMF needs access to the files you choose to
> manage.

Then show benefits:

``` text
✓ Find large files
✓ Detect duplicates
✓ Analyze folders
✓ Organize files
```

Offer:

**Manage All Files**

and:

**Choose Folders Instead**

The user must understand the difference.

------------------------------------------------------------------------

# 26. Settings

Settings should be grouped:

``` text
Storage Access
Scanning
Cleanup
Organization
Privacy
AI
Advanced
```

Avoid a giant ungrouped settings list.

Show current state:

``` text
Storage Access
Full storage access     >
```

rather than:

``` text
Storage Permission
```

------------------------------------------------------------------------

# 27. Navigation

Use a bottom navigation with 4 destinations:

``` text
Home
Categories
Tools
More
```

Icons + labels.

Do not use icon-only navigation for primary destinations.

Use a floating action button only if it has a truly primary action.

------------------------------------------------------------------------

# 28. Motion

Motion should communicate state.

Use: - subtle page transitions - progress animation - card expansion -
list insertion/removal - storage chart animation

Avoid: - excessive bouncing - long transitions - decorative animations
on every tap

Recommended motion duration: - micro interaction: 120--180ms - normal
transition: 180--280ms - larger reveal: 280--400ms

Respect Android reduced-motion/accessibility settings where available.

------------------------------------------------------------------------

# 29. Haptics

Use haptics sparingly for: - successful cleanup - restore - important
confirmation - completed scan

Never vibrate for every list interaction.

------------------------------------------------------------------------

# 30. Accessibility

Must support: - large text - sufficient contrast - touch targets around
44dp or larger - screen readers - meaningful content descriptions -
non-color-only status communication

Never communicate:

> "Red means dangerous"

without text or icon context.

------------------------------------------------------------------------

# 31. Error UX

Errors should explain:

1.  What happened.
2.  Why it happened if known.
3.  What the user can do next.

Bad:

> `Permission denied`

Good:

> "Android blocked access to this folder."

CTA:

**Grant Access**

Secondary:

**Choose Another Folder**

------------------------------------------------------------------------

# 32. Destructive Actions

Use a consistent hierarchy:

### Neutral

Open / View / Search

### Primary

Analyze / Organize / Review

### Warning

Move to Trash

### Destructive

Delete Permanently

Never use the destructive color for ordinary actions.

------------------------------------------------------------------------

# 33. Design System Components

Build reusable components:

``` text
AppBar
StorageRing
StorageBar
CategoryCard
FileRow
FileGrid
QuickAction
InsightCard
SuggestionCard
ConfidenceBadge
FilterChip
BottomSheet
PermissionCard
ScanProgress
EmptyState
ErrorState
ConfirmSheet
TrashCard
```

Do not create one-off UI components for every screen.

------------------------------------------------------------------------

# 34. Responsive Behavior

Although Android is the primary target, the UI layer should adapt to
larger screens.

Phone: - single column - bottom navigation

Tablet: - two-column layouts where useful - side navigation if
appropriate - larger preview/detail panels

Do not simply stretch the phone UI across the entire tablet width.

------------------------------------------------------------------------

# 35. UI Anti-Patterns

Never build WTFMF as:

-   generic admin dashboard
-   spreadsheet-like file table
-   Windows Explorer clone
-   giant hamburger menu
-   endless card stacking
-   excessive glassmorphism
-   excessive neon
-   AI chat as the home screen
-   giant donut chart with no useful context
-   permission wall before explaining the product
-   "Delete All" as a primary CTA

------------------------------------------------------------------------

# 36. Copywriting Rules

Copy should be:

-   concise
-   human
-   confident
-   slightly playful
-   never condescending

Good:

> "Found 14.7 GB you might want to clean up."

Good:

> "Your Downloads folder is doing numbers."

Bad:

> "WARNING!!! YOUR STORAGE IS CRITICALLY FULL!!!"

Bad:

> "Congratulations! You have successfully optimized your digital
> ecosystem!"

Avoid corporate jargon.

------------------------------------------------------------------------

# 37. Premium Feel Checklist

Every major screen should have:

-   clear hierarchy
-   strong title
-   one obvious primary action
-   restrained secondary actions
-   consistent spacing
-   consistent iconography
-   meaningful empty state
-   loading state
-   error state
-   accessible contrast
-   no unnecessary visual noise

------------------------------------------------------------------------

# 38. Final Design Test

Before considering a screen complete, ask:

### Can I understand it in 2 seconds?

### Do I know what the primary action is?

### Can I tell what will happen before I tap it?

### Is there any chance I could accidentally lose a file?

### Does it look like a premium product rather than a template?

### Does the screen still make sense without color?

### Is there unnecessary information?

### Does the screen feel calm even when showing lots of files?

If any answer is bad, redesign the screen.

------------------------------------------------------------------------

# 39. Design North Star

WTFMF should feel like:

> **A calm, intelligent control center for a chaotic phone.**

The user opens it because their storage is a mess.

They leave thinking:

> "Okay. Now I actually know what's going on."

The design should make complexity feel simple.
