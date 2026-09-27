import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * ADR-001: SvelteKit is used ONLY for its file-based routing and
 * conventions. This app is compiled to a fully static SPA bundle
 * (fallback: index.html) and shipped inside Capacitor's WebView.
 * There is no SSR, no Node server on-device, and no server-side
 * data loading — every +page.ts / +layout.ts must run client-side
 * only (ssr = false, ssg = false are set in +layout.ts).
 * See docs/adr/ADR-011-sveltekit-as-router.md
 */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA fallback — required for client-side routing in Capacitor's WebView
      precompress: false,
      strict: true
    }),
    // No server; every route is prerendered as static shell + client-side hydration
    appDir: 'app'
  }
};

export default config;
