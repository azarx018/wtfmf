# ADR-012 — Final Decisions (Locked Before First Native Build)

**STATUS: RESOLVED**

All six decisions below are locked for the first native implementation.
No native implementation should introduce a different interpretation of
these decisions without a new ADR or an explicit amendment to this one.

---

## Conflicts found against the existing scaffold, and how they were resolved

Two of the six decisions below required a small, non-native code change
to the TypeScript interfaces generated earlier, otherwise the contract
in code would silently contradict this ADR:

- **`PermissionState`** (`src/lib/types/permission.ts`) only had a single
  `'PARTIAL'` value with no way to represent *which kind* of partial
  access was granted. Resolved by adding an optional `partialSource`
  field to `PermissionSnapshot` (`'PARTIAL_SAF' | 'PARTIAL_MEDIA_SELECTED'`)
  rather than changing the `PermissionState` enum itself — the enum
  matches WTFMF_ENGINEERING_SPEC.md §4/§10 exactly and stays that way.
- **`DuplicateService.keepOne()`** returned `OperationResult<void>` —
  a single pass/fail for the whole group, which cannot represent
  "deleted: 2, failed: 1, skipped: 0" as decision #6 requires. Resolved
  by introducing `KeepOneResult` / `DuplicateMemberOperationResult` types
  and changing the return type to `OperationResult<KeepOneResult>`.

No other conflicts were found. `OrganizationRule.priority`,
`ProviderCapabilities`, and the `OperationResult` error model already
supported the remaining four decisions without modification.

---

## 1. Min/target Android SDK & scoped storage strategy — RESOLVED

**Final decision:**

- `minSdkVersion = 26`
- `targetSdkVersion = 34`
- `compileSdkVersion = 35` if supported by the selected Android toolchain
  (see "Compile SDK Fallback" below)

**Storage behavior:**

*MANAGE_EXTERNAL_STORAGE*
`MANAGE_EXTERNAL_STORAGE` remains supported on API 34.
`PermissionService.requestFullAccess()` must launch
`Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION` — this is a
dedicated settings screen, not a normal runtime permission dialog.
Permission state must be re-checked on `onResume` after returning from
Settings (already required by spec §10).

*API 33+*
Use granular media permissions where applicable: `READ_MEDIA_IMAGES`,
`READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`. Do not rely on the obsolete
`READ_EXTERNAL_STORAGE` behavior for API 33+ media access.

*API 34+*
Support `READ_MEDIA_VISUAL_USER_SELECTED` — partial access to
user-selected photos/videos via the system Photo Picker.

`PermissionState.PARTIAL` (unchanged, per spec §4/§10) is extended at
the snapshot level with an internal source distinction:
`PARTIAL_SAF` vs `PARTIAL_MEDIA_SELECTED` (see
`PermissionSnapshot.partialSource` in `src/lib/types/permission.ts`).
The UI/recovery action must reflect the actual source:

- SAF partial access → re-open/re-pick SAF folder
- selected-media partial access → re-open Photo Picker / media selection flow

SAF remains supported as a provider/fallback for user-selected
folders/files. Since WTFMF is sideloaded (spec §37), Play Store's extra
restrictions on declaring `MANAGE_EXTERNAL_STORAGE` don't apply.

`minSdkVersion` must not be lowered below 26 unless a later ADR
explicitly changes this decision.

---

## 2. Partial-hash strategy — RESOLVED

**Final decision:**

- Algorithm: `xxHash64`
- Input: first 64 KiB of the file + last 64 KiB of the file + file size
- Conceptually: `partialHash = xxHash64(fileSize || first64KiB || last64KiB)`

The partial hash is **only a candidate filter**. It is **not**
authoritative proof that two files are identical.

**Duplicate detection flow:**

1. Compare file size.
2. Calculate partial hash.
3. Group potential candidates.
4. Calculate full SHA-256 for candidates.
5. Confirm duplicates only when the full SHA-256 matches.

For files ≤ 128 KiB, avoid reading the same bytes twice — read/hash the
complete file in one pass instead of computing separate "first 64 KiB"
and "last 64 KiB" reads that would overlap or re-read the whole file.

SHA-256 remains the authoritative full-file identity and must not be
replaced by xxHash64 for final duplicate confirmation.

---

## 3. Organization rule conflict resolution — RESOLVED

**Final decision:**

`OrganizationRule.priority` determines precedence — higher priority wins.

If two enabled rules match the same file with identical priority: the
lowest `id` (earliest-created rule) wins.

**Deterministic ordering:** `priority DESC, id ASC`

- higher priority → wins
- equal priority → lower ID wins

This ordering must be applied explicitly in the query/comparator — never
relied upon implicitly via database query order or insertion order. It
must be deterministic and testable.

(Reflected in `OrganizationRuleRepository.listEnabledByPriority()` —
see docstring in `src/lib/repositories/OrganizationRuleRepository.ts`.)

---

## 4. APK signing / release process — RESOLVED

WTFMF is a personal-use / sideloaded Android application. Release APKs
must still be properly signed. The signing keystore must never be
committed to Git.

**GitHub Actions release signing uses GitHub Actions Secrets:**

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

The keystore stays outside the repository at all times.
`.gitignore` includes `*.jks` and `*.keystore` (already applied — see
`.gitignore`).

- Debug builds may use the normal debug signing configuration.
- Release builds must use the private release keystore.
- GitHub Actions produces the signed release APK as a build artifact.
- Play App Signing is **not** required — distribution is
  sideloaded/personal-use, not Play Store.
- Passwords, aliases, and keystore material must never be hardcoded into
  source code or workflow files.

(Implemented in `.github/workflows/android-build.yml`. Setup steps for
the four secrets are in `docs/ci/android-signing-setup.md`, and the
Gradle `signingConfig` to merge into `android/app/build.gradle` once
generated is in
`native/android-build-reference/app-build.gradle.signing-snippet.gradle`.)

---

## 5. Light theme — RESOLVED

WTFMF v1 is **dark only**. A light theme is not implemented as part of
the first native build.

The design/token architecture should avoid unnecessarily preventing a
future light theme, but no scope is added now to support it. Existing
dark design tokens (`src/lib/tokens/tokens.css`) remain the source of
truth for v1. Future light-theme support may be introduced in a
separate ADR.

---

## 6. Duplicate detection across different StorageProvider roots — RESOLVED

Duplicate groups must not assume every member has identical
capabilities. Capabilities are evaluated **per file / per duplicate
member**, not per group.

**Example:**

```
Duplicate Group:
  File A → FullStorageProvider → delete supported
  File B → SafStorageProvider  → delete supported
  File C → SAF/read-only location → delete unsupported
```

The duplicate group itself must not expose a single simplistic
`canDelete` assumption at the group level.

`DuplicateService.keepOne()` must:

1. Select the keeper.
2. Evaluate capabilities for every non-keeper member individually.
3. Perform the requested operation only where supported.
4. Report failures/skips per member.

Capabilities considered: `canMove`, `canDelete`, `canRename` (see
`ProviderCapabilities` in `src/lib/providers/StorageProvider.ts` —
already supports this per-provider; the change here is that
`DuplicateService.keepOne()` must now surface a per-member result
instead of a single pass/fail).

The operation result must accurately represent partial success, e.g.
`{ deleted: 2, failed: 1, skipped: 0 }`. Do not report the whole group
operation as succeeded if one or more individual members failed. Do not
roll back successful operations unless the architecture explicitly
provides a real transactional mechanism (it currently does not, for
cross-file filesystem operations spanning providers).

(Reflected in `KeepOneResult` / `DuplicateMemberOperationResult` in
`src/lib/services/DuplicateService.ts`.)

---

## Compile SDK Fallback

**Contract:**

```
minSdk     = 26
targetSdk  = 34
compileSdk = 35 preferred
compileSdk = 34 fallback
```

Prefer `compileSdk 35`, but accept `compileSdk 34` when 35 is not
cleanly supported by the existing Android Gradle Plugin / Gradle /
Kotlin toolchain.

If `compileSdkVersion = 35` causes a toolchain compatibility problem, a
build failure, or requires an unrelated dependency/toolchain upgrade
outside the current project scope:

1. Fall back to `compileSdkVersion = 34`.
2. Keep `targetSdkVersion = 34`.
3. Keep `minSdkVersion = 26`.
4. Do not lower `targetSdkVersion` below 34.
5. Do not lower `minSdkVersion` below 26.
6. Do not introduce unrelated Gradle, AGP, Kotlin, or dependency
   upgrades solely to force compile SDK 35.

`compileSdk` is a build-time API surface and does not determine the
minimum Android version the app supports — falling back from 35 to 34
does not change the runtime support decision above. Before choosing the
fallback, verify the actual project toolchain and document which
compile SDK was selected and why (this note to be updated once
`npx cap add android` has been run and the toolchain is known).

Never silently change `targetSdk` or `minSdk` as a workaround for a
compile SDK issue.

---

## Final Status

| # | Decision | Final Decision | Status |
|---|----------|-----------------|--------|
| 1 | Min/target Android SDK & scoped storage | `minSdk = 26`, `targetSdk = 34`, `compileSdk = 35 if supported`; modern Android storage/permission handling | RESOLVED |
| 2 | Partial-hash strategy | `xxHash64` over file size + first 64 KiB + last 64 KiB; SHA-256 remains authoritative | RESOLVED |
| 3 | Rule conflict resolution | `priority DESC`, then `id ASC` for deterministic first-created tie-breaking | RESOLVED |
| 4 | APK signing / release process | Signed release APK; keystore stored securely via GitHub Actions Secrets; never committed | RESOLVED |
| 5 | Light theme | Dark-only for v1; light theme deferred to a future ADR | RESOLVED |
| 6 | Duplicate detection across StorageProvider roots | Capabilities evaluated independently for every duplicate member/file | RESOLVED |

**ADR-012 Overall Status: RESOLVED**
