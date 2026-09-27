# Native Android Plugin Reference — NOT YET INTEGRATED

**Status: source written, not built, not tested.**

This sandbox has no network access and no Android SDK, so `npx cap add
android` could not be run here, and none of the Kotlin below has been
compiled. These files exist so the permission flow's native half is
fully specified and ready to drop in — the actual integration and build
must happen in your own environment or the GitHub Actions workflow.

## What's here

- `WtfmfPermissionPlugin.kt` — the Capacitor plugin implementing
  `checkState` / `requestFullAccess` / `requestSafFolder`, matching
  `src/lib/native/permissionPlugin.ts` method-for-method. Implements the
  precedence rule from ADR-012 #1 (FULL > PARTIAL_SAF > PARTIAL_MEDIA_SELECTED > NONE).
- `MainActivity.kt` — shows where `registerPlugin(WtfmfPermissionPlugin::class.java)` goes.
- `AndroidManifest.permissions.xml` — the exact `<uses-permission>` block
  for minSdk 26 / targetSdk 34 (ADR-012 #1), including the legacy
  `maxSdkVersion="29"` fallback and the API 34 partial-media permission.

## Integration steps (once `npx cap add android` has been run)

1. Copy `WtfmfPermissionPlugin.kt` to
   `android/app/src/main/java/com/wtfmf/app/WtfmfPermissionPlugin.kt`.
2. Merge `MainActivity.kt`'s `registerPlugin(...)` call into the
   generated `android/app/src/main/java/com/wtfmf/app/MainActivity.kt`
   (Capacitor generates its own `MainActivity.kt` — don't just overwrite it,
   merge the one line + import).
3. Merge the `<uses-permission>` entries from
   `AndroidManifest.permissions.xml` into
   `android/app/src/main/AndroidManifest.xml`, inside the `<manifest>` tag
   and above `<application>`. Add `xmlns:tools="http://schemas.android.com/tools"`
   to the `<manifest>` tag if not already present (needed for the
   `tools:ignore="ScopedStorage"` attribute).
4. Set `minSdkVersion 26`, `targetSdkVersion 34`, `compileSdkVersion 35`
   (or `34` on fallback — see ADR-012 "Compile SDK Fallback") in
   `android/variables.gradle`.
5. Run `npm run cap:sync` to pull `@capacitor/app` and
   `@capacitor-community/sqlite` native dependencies in.
6. Build via Android Studio or the GitHub Actions workflow (not yet
   written — see ADR-012 §4 signing decision) and test on the actual
   device (Redmi 10, Android 14) before trusting the permission
   precedence logic — OEM (MIUI/HyperOS) storage-permission screens are
   known to deviate from stock AOSP behavior in exactly the area this
   plugin touches.

## What is NOT done here

- No error handling for the case where `startActivityForResult` itself
  throws on an OEM ROM that blocks the settings intent entirely.
- No handling for a user who grants SAF access to a *sub*-folder of one
  already granted (URI permission de-duplication) — out of scope for
  this vertical slice.
- No native tests. Kotlin unit tests for this plugin are a good next
  step once `android/` exists and can host `androidTest`/`test` source sets.
