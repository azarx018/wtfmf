import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // Capacitor loads the built app from a file:// / capacitor:// origin,
  // so all asset URLs must be relative.
  base: './',
  server: {
    port: 5173,
    fs: { allow: ['..'] }
  },
  build: {
    target: 'es2020',
    sourcemap: true
  }
});
