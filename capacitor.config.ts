import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wtfmf.app',
  appName: 'WTFMF',
  webDir: 'build',
  // Personal-use app: no remote server, no live-reload URL in production.
  server: {
    androidScheme: 'https'
  },
  android: {
    // ADR-012 #1 (RESOLVED): minSdk 26, targetSdk 34 (Android 14, primary
    // device Redmi 10), compileSdk 35 preferred / 34 fallback. Set in
    // android/variables.gradle once `npx cap add android` has been run.
    // See docs/adr/ADR-012-open-decisions.md
    allowMixedContent: false
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false
    }
  }
};

export default config;
