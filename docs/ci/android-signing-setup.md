# Android Release Signing Setup (ADR-012 §4)

One-time setup so `.github/workflows/android-build.yml`'s release job can
produce a signed APK. Do this once `android/` exists.

## 1. Generate a keystore

Keep it forever — losing it means you can never sign an update under the
same identity again.

```bash
keytool -genkeypair -v \
  -keystore wtfmf-release.keystore \
  -alias wtfmf \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store `wtfmf-release.keystore` somewhere safe **outside the repo**
(password manager, encrypted backup). `.gitignore` already excludes
`*.keystore` and `*.jks`, but don't rely on that alone — never put it in
a folder that gets `git add`-ed.

## 2. Base64-encode it

```bash
# Linux
base64 -w0 wtfmf-release.keystore > wtfmf-release.keystore.b64

# macOS
base64 -i wtfmf-release.keystore | tr -d '\n' > wtfmf-release.keystore.b64
```

## 3. Add repository secrets

GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | contents of `wtfmf-release.keystore.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore password you set in step 1 |
| `ANDROID_KEY_ALIAS` | `wtfmf` (or whatever alias you used) |
| `ANDROID_KEY_PASSWORD` | the key password you set in step 1 |

## 4. Wire the signing config into Gradle

Once `android/app/build.gradle` exists, merge in
`native/android-build-reference/app-build.gradle.signing-snippet.gradle`.

## 5. Trigger a signed build

```bash
git tag v0.1.0
git push origin v0.1.0
```

or trigger manually: Actions tab → "Android Build" → Run workflow.

The debug job runs on every push/PR regardless — it needs none of this.
