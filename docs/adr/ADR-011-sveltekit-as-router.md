# ADR-011 — SvelteKit as a Static Router (No SSR)

## Context
WTFMF_ENGINEERING_SPEC.md §2 leaves this open: "SvelteKit may be used if
routing requirements justify it, but the Android app does not depend on
SSR." The app has ~18 distinct screens (spec §41) with nested navigation
(bottom-nav tabs, pushed detail/review screens, a multi-step cleanup and
organization flow).

## Decision
Use SvelteKit with `@sveltejs/adapter-static` in SPA mode
(`fallback: 'index.html'`), with `ssr = false` and `prerender = false`
set globally in `src/routes/+layout.ts`.

## Alternatives considered
- **Plain Svelte + Vite + a client router (e.g. svelte-spa-router):**
  fewer moving parts, but reinvents file-based routing conventions and
  nested layouts that SvelteKit already provides for free.
- **SvelteKit with SSR/Node adapter:** unnecessary — there is no server,
  and Capacitor loads the WebView from a local static bundle.

## Reason
File-based routing keeps the 18-screen structure legible (folder = screen)
and gives nested layouts, typed route params (`[id]`, `[groupId]`), and
prefetching for free, without requiring a running server on-device.

## Consequences
- Every `+page.ts`/`+layout.ts` must avoid server-only APIs.
- `capacitor.config.ts` points `webDir` at the static `build/` output.
- Deep-linking behavior on Android must be verified against the
  `fallback: 'index.html'` static-adapter routing (any URI outside the
  known routes falls back to the SPA shell, which then 404s client-side —
  acceptable for a single-app WebView with no external deep links expected).
