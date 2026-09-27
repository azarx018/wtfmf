#!/usr/bin/env bash
set -euo pipefail

# WTFMF — one-time Android platform bootstrap.
#
# Generates android/ via the real Capacitor CLI (needs network — run this
# via .github/workflows/bootstrap-android.yml, or locally, NOT in an
# offline sandbox) and merges in this project's custom native pieces:
# the WtfmfPermissionPlugin, its MainActivity registration, the ADR-012 §1
# manifest permissions, and the ADR-012 §1 SDK versions.
#
# Safe to re-run: skips `cap add android` if android/ already exists.
# Every merge step warns instead of silently corrupting a file it doesn't
# recognize — check the output.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PKG_PATH="android/app/src/main/java/com/wtfmf/app"

if [ -d "android" ]; then
  echo "android/ already exists — skipping 'cap add android'. Delete it first for a clean regenerate."
else
  echo "==> npm install"
  # No package-lock.json exists yet in this repo (never `npm install`-ed
  # anywhere with network access before now) — `npm install` generates it.
  # Future runs (once the lock file is committed) can go back to `npm ci`.
  npm install

  echo "==> Building web assets (required before cap add)"
  npm run build

  echo "==> npx cap add android"
  npx cap add android
fi

echo "==> Copying WtfmfPermissionPlugin.kt"
mkdir -p "$PKG_PATH"
cp native/android-plugin-reference/WtfmfPermissionPlugin.kt "$PKG_PATH/WtfmfPermissionPlugin.kt"

echo "==> Registering plugin in MainActivity.kt"
MAIN_ACTIVITY="$PKG_PATH/MainActivity.kt"
if [ -f "$MAIN_ACTIVITY" ] && ! grep -q "WtfmfPermissionPlugin" "$MAIN_ACTIVITY"; then
  if grep -q "^class MainActivity : BridgeActivity() {}$" "$MAIN_ACTIVITY"; then
    cat > "$MAIN_ACTIVITY" << 'KOTLIN'
package com.wtfmf.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(WtfmfPermissionPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
KOTLIN
    echo "    MainActivity.kt updated."
  else
    echo "    WARNING: MainActivity.kt didn't match the expected Capacitor template."
    echo "    Merge native/android-plugin-reference/MainActivity.kt by hand."
  fi
else
  echo "    MainActivity.kt already registers the plugin, or wasn't found — skipping."
fi

echo "==> Merging AndroidManifest.xml permissions"
MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ] && ! grep -q "MANAGE_EXTERNAL_STORAGE" "$MANIFEST"; then
  PERMS_FILE=$(mktemp)
  # Strip the leading explanatory XML comment before inserting the rest.
  awk '/-->/{found=1; next} found' native/android-plugin-reference/AndroidManifest.permissions.xml > "$PERMS_FILE"

  if ! grep -q 'xmlns:tools=' "$MANIFEST"; then
    sed -i 's#<manifest #<manifest xmlns:tools="http://schemas.android.com/tools" #' "$MANIFEST"
  fi

  awk -v permsfile="$PERMS_FILE" '
    { print }
    /<manifest / && !inserted {
      while ((getline line < permsfile) > 0) print line
      inserted=1
    }
  ' "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"
  rm -f "$PERMS_FILE"
  echo "    Permissions merged."
else
  echo "    Permissions already present, or manifest not found — skipping."
fi

echo "==> Setting SDK versions in variables.gradle (ADR-012 §1)"
VARS="android/variables.gradle"
if [ -f "$VARS" ]; then
  sed -i \
    -e "s/minSdkVersion = [0-9]*/minSdkVersion = 26/" \
    -e "s/targetSdkVersion = [0-9]*/targetSdkVersion = 34/" \
    -e "s/compileSdkVersion = [0-9]*/compileSdkVersion = 35/" \
    "$VARS"
  echo "    variables.gradle updated."
  echo "    If compileSdk 35 fails to build cleanly, fall back to 34 per"
  echo "    ADR-012's 'Compile SDK Fallback' section — do not lower minSdk/targetSdk."
else
  echo "    WARNING: android/variables.gradle not found — set SDK versions by hand per ADR-012 §1."
fi

echo ""
echo "==> Manual step remaining: signing config"
echo "    Merge native/android-build-reference/app-build.gradle.signing-snippet.gradle"
echo "    into android/app/build.gradle by hand — inserting into an existing"
echo "    Groovy block reliably via sed is too risky to do unattended."
echo ""
echo "Done. Review the diff before committing."
