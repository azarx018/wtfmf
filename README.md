# WTFMF — Where The Fuck Is My File?

Local-first Android file intelligence & organization app.
See `docs/` (once populated) and the two source specs this scaffold was
generated from:

- `WTFMF_MASTER_PROMPT.md` — product principles, MVP scope, UX flow
- `WTFMF_ENGINEERING_SPEC.md` — architecture, DB schema, performance budget
- `WTFMF_UI_UX_RULES.md` — visual language, copywriting, components

## Status

This is an **architecture scaffold**, not a working app yet. Every
service, repository, and provider is an interface or a stub that throws
`Not implemented`. What's real:

- Folder structure matching the layered architecture in spec §3
- All 18 required screens (spec §41) exist as routes with placeholder content
- SQLite wired to `@capacitor-community/sqlite`, migrations running for real
  (`SettingsRepository` is the first concrete implementation on top of it —
  see below for what's still a stub)
- Domain types matching the schema exactly
- Design tokens (`src/lib/tokens/tokens.css`) from the UI/UX rules palette
- 8 Svelte stores wired to the state-ownership table in spec §4.1
- Bottom navigation shell (Home / Categories / Tools / More)
- One fully wired example: Cleanup Review → Trash flow
  (`src/lib/usecases/moveSelectedToTrash.ts`) — use this as the template
  for wiring every other screen

## Architecture

```
UI (routes/*.svelte)
  ↓
Use Cases (src/lib/usecases) — the only thing pages call into
  ↓
Stores (src/lib/stores) — current-page UI state, never the full index
  ↓
Services (src/lib/services) — business logic
  ↓
Repositories (src/lib/repositories) + StorageProvider (src/lib/providers)
  ↓
SQLite (src/lib/db) / Android filesystem
```

## CI

`.github/workflows/android-build.yml` builds a debug APK on every push/PR
(no secrets needed) and a signed release APK on version tags (`v*.*.*`)
or manual dispatch. One-time signing setup: `docs/ci/android-signing-setup.md`.
The workflow expects `android/` to already be committed — it fails fast
with a clear error if it isn't (see "Getting started" below).

## Getting started

```bash
npm install
npm run dev          # runs in browser for UI work — no native APIs available
npm run check         # type-check
```

### Generating the native Android project

This was **not** hand-generated in this scaffold — it needs real network
access to fetch the Gradle wrapper and Android dependencies, which this
authoring environment didn't have. Two ways to do it:

**Option A — GitHub Actions (recommended, matches your CI setup):**
Push this repo, then Actions tab → "Bootstrap Android Platform" → Run
workflow. It runs `scripts/bootstrap-android.sh` on a runner with network
access, merges in the custom native plugin + ADR-012 SDK settings, and
commits `android/` back to the repo. One manual step remains after: merge
`native/android-build-reference/app-build.gradle.signing-snippet.gradle`
into `android/app/build.gradle` by hand (see script output).

**Option B — locally:**
```bash
bash scripts/bootstrap-android.sh
npm run cap:open      # open in Android Studio
```

After `android/` exists and is committed, `.github/workflows/android-build.yml`
handles regular debug/release builds.

## Before writing real service implementations

1. Read `docs/adr/ADR-011-sveltekit-as-router.md` — why SvelteKit, and the
   constraint it puts on every `+page.ts`/`+layout.ts` (no SSR-only APIs).
2. Read `docs/adr/ADR-012-open-decisions.md` — all six decisions are now
   RESOLVED (SDK versions, partial-hash algorithm, rule tie-breaking,
   APK signing, dark-only v1, per-file duplicate capability checks).
   These are locked; implement `src/lib/providers/*` (still stubs — `FullStorageProvider`/`SafStorageProvider`
   need a real native file-listing bridge) against them as-is.
3. `src/lib/db/client.ts` is wired to `@capacitor-community/sqlite` and
   compiles against the documented API, but **hasn't been exercised on a
   real device yet** — `SettingsRepository` is the only repository built
   on top of it so far (used by the permission flow). The other 6
   repositories in `src/lib/repositories/` are still interfaces only.

## Non-goals (spec §37)

No accounts, subscriptions, ads, paywalls, feature gating, cloud sync,
server-side profiles, billing, or mandatory telemetry. Keep it that way.
