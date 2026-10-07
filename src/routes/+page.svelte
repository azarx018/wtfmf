<!--
  Screen: Home
  Ref: WTFMF_ENGINEERING_SPEC.md §41, screen 02
  Pass 1 only (metadata scan) — shows total size/count, not yet a
  category breakdown (that needs CategorizationService, not built yet).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { storageStore } from '$lib/stores/storageStore';
  import { fileRepository } from '$lib/bootstrap';
  import { loadStorageSummary } from '$lib/usecases/scanFlow';
  import { formatBytes } from '$lib/utils/formatBytes';

  onMount(() => {
    void loadStorageSummary(fileRepository);
  });

  $: hasScanned = $storageStore.lastLoadedAt !== null && $storageStore.totalCount > 0;
</script>

<section class="home">
  <h1 class="home__title">WTFMF</h1>

  <div class="card">
    {#if $storageStore.loading}
      <p class="card__muted">Loading…</p>
    {:else if hasScanned}
      <p class="card__big">{formatBytes($storageStore.totalSize)}</p>
      <p class="card__muted">{$storageStore.totalCount.toLocaleString()} files scanned</p>
    {:else}
      <p class="card__muted">Scan your storage to see what's taking space.</p>
    {/if}
  </div>

  <button class="button button--primary" on:click={() => goto('/scan/')}>
    {hasScanned ? 'Scan again' : 'Analyze'}
  </button>

  <p class="home__note">
    This is Pass 1 only — file metadata, no category breakdown yet. Duplicates,
    large files, and old files views come next.
  </p>
</section>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: var(--space-20);
    padding: var(--space-24) var(--space-16);
    max-width: 480px;
    margin: 0 auto;
  }

  .home__title {
    font-size: var(--font-size-title);
  }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card-lg);
    padding: var(--space-24);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .card__big {
    font-size: var(--font-size-display);
    font-weight: 700;
  }

  .card__muted {
    color: var(--color-text-muted);
    font-size: var(--font-size-body);
  }

  .button {
    height: var(--button-height);
    border-radius: var(--radius-button);
    border: none;
    font-size: var(--font-size-body);
    font-weight: 600;
    min-height: var(--touch-min);
  }

  .button--primary {
    background: var(--color-accent-primary);
    color: var(--color-background);
  }

  .home__note {
    font-size: var(--font-size-secondary);
    color: var(--color-text-muted);
  }
</style>
