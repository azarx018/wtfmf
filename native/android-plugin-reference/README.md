# Native Android Plugin Reference

**Status: verified against a real generated `android/` project (Capacitor
6.x). Copied here from the actual working files after the bootstrap
workflow ran — not hand-guessed.**

## What's here

- `WtfmfPermissionPlugin.java` — the Capacitor plugin implementing
  `checkState` / `requestFullAccess` / `requestSafFolder`, matching
  `src/lib/native/permissionPlugin.ts` method-for-method. Implements the
  precedence rule from ADR-012 #1 (FULL > PARTIAL_SAF > PARTIAL_MEDIA_SELECTED > NONE).
  **Written in Java, not Kotlin** — this Capacitor template has no Kotlin
  Gradle plugin configured (confirmed: no `kotlin-android` anywhere in
  `android/build.gradle` or `android/app/build.gradle`), so a `.kt` file
  dropped into `src/main/java` would silently never be compiled.
- `MainActivity.java` — the actual `MainActivity.java` Capacitor generates
  (as **Java**, not Kotlin — the earlier version of this file assumed
  Kotlin and was wrong), with `registerPlugin(WtfmfPermissionPlugin.class)`
  added in an overridden `onCreate`.
- `AndroidManifest.permissions.xml` — the `<uses-permission>` block for
  minSdk 26 / targetSdk 34 (ADR-012 #1).

## Known-fixed issues from the first real bootstrap run

1. **Capacitor generates `MainActivity.java`, not `.kt`.** The bootstrap
   script originally looked for a `.kt` file that never existed, so the
   plugin registration step silently no-opped. Fixed in
   `scripts/bootstrap-android.sh` and in this reference set.
2. **The manifest-merge `awk` command had an unguarded pattern.** The
   command used to strip the reference file's leading explanatory
   comment matched `-->` on *every* line, not just the first — which ate
   the closing `-->` of the trailing note comment near the bottom of
   `AndroidManifest.permissions.xml` too, corrupting the merged manifest
   (the `<application>` block ended up swallowed inside an unterminated
   XML comment). Fixed with a `!found` guard in
   `scripts/bootstrap-android.sh`.
3. `signingConfigs`/`buildTypes.release.signingConfig` merge into
   `android/app/build.gradle` is still a manual step — see
   `native/android-build-reference/app-build.gradle.signing-snippet.gradle`,
   now written to match the *actual* generated file's structure exactly
   (confirmed against a real bootstrap run) rather than a guess.

## Integration steps (for a from-scratch regenerate)

1. Delete `android/`, then run `scripts/bootstrap-android.sh` again (or
   the "Bootstrap Android Platform" GitHub Actions workflow).
2. The script copies `WtfmfPermissionPlugin.java` in and rewrites
   `MainActivity.java` automatically.
3. **Diff the merged `AndroidManifest.xml` before committing** — confirm
   it still ends with `</manifest>` and every comment is properly closed.
4. Merge the signing snippet into `android/app/build.gradle` by hand.
5. Build via the `android-build.yml` workflow, or Android Studio, and
   test on the actual device (Redmi 10, Android 14) before trusting the
   permission precedence logic — OEM (MIUI/HyperOS) storage-permission
   screens are known to deviate from stock AOSP behavior in exactly the
   area this plugin touches.

## What is still NOT done

- No error handling for `startActivityForResult` itself throwing on an
  OEM ROM that blocks the settings intent entirely.
- No handling for a user granting SAF access to a *sub*-folder of one
  already granted (URI permission de-duplication).
- No native tests yet (`android/app/src/test`, `androidTest` exist as
  empty directories from the Capacitor template).
