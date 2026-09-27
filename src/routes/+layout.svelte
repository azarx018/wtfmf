<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { initAppLifecycle } from '$lib/bootstrap';

  onMount(() => {
    initAppLifecycle();
  });

  // Bottom nav per WTFMF_UI_UX_RULES.md §27 — 4 destinations, icon + label,
  // never icon-only for primary destinations.
  const destinations = [
    { href: '/', label: 'Home', match: (p: string) => p === '/' },
    { href: '/categories/', label: 'Categories', match: (p: string) => p.startsWith('/categories') },
    { href: '/tools/', label: 'Tools', match: (p: string) => p.startsWith('/tools') },
    { href: '/settings/', label: 'More', match: (p: string) => p.startsWith('/settings') }
  ];

  // Screens that are pushed on top of the tab flow (onboarding, scan,
  // file detail, cleanup review, etc.) hide the bottom nav.
  const fullScreenRoutes = ['/onboarding/', '/scan/'];
  $: hideNav = fullScreenRoutes.some((r) => $page.url.pathname.startsWith(r));
</script>

<div class="app-shell">
  <main class="app-content">
    <slot />
  </main>

  {#if !hideNav}
    <nav class="bottom-nav" aria-label="Primary">
      {#each destinations as d}
        <a
          href={d.href}
          class="bottom-nav__item"
          class:is-active={d.match($page.url.pathname)}
          aria-current={d.match($page.url.pathname) ? 'page' : undefined}
        >
          <span class="bottom-nav__label">{d.label}</span>
        </a>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text);
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: calc(64px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
  }

  .bottom-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: var(--touch-min);
    min-height: var(--touch-min);
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 12px;
  }

  .bottom-nav__item.is-active {
    color: var(--color-accent-primary);
  }
</style>
