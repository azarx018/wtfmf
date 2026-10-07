<!--
  Screen: Scan Progress
  Ref: WTFMF_ENGINEERING_SPEC.md §41, screen 17
  UI/UX rules §24 — real progress, not a generic spinner; Pause/Cancel
  where supported. (Pause here is a documented approximation — see
  ScannerServiceImpl's doc comment; it cancels and marks the session
  PAUSED rather than truly suspending mid-walk.)
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { scanStore } from '$lib/stores/scanStore';
  import { fileRepository, scannerService } from '$lib/bootstrap';
  import { startScan, cancelScan } from '$lib/usecases/scanFlow';

  onMount(() => {
    void startScan(scannerService, fileRepository);
  });

  $: isDone =
    $scanStore.status === 'COMPLETED' ||
    $scanStore.status === 'CANCELLED' ||
    $scanStore.status === 'FAILED';

  async function handleCancel() {
    await cancelScan(scannerService);
  }
</script>

<section class="scan">
  <h1 class="scan__title">Scanning storage…</h1>

  <p class="scan__count">
    {($scanStore.progress?.filesProcessed ?? 0).toLocaleString()} files
  </p>

  {#if $scanStore.progress?.currentPath}
    <p class="scan__path">{$scanStore.progress.currentPath}</p>
  {/if}

  {#if $scanStore.status === 'FAILED'}
    <p class="scan__error">{$scanStore.error}</p>
  {/if}

  <div class="scan__actions">
    {#if !isDone}
      <button class="button button--secondary" on:click={handleCancel}>Cancel</button>
    {:else}
      <button class="button button--primary" on:click={() => goto('/')}>Done</button>
    {/if}
  </div>
</section>

<style>
  .scan {
    display: flex;
    flex-direction: column;
    gap: var(--space-16);
    padding: var(--space-24) var(--space-16);
    max-width: 480px;
    margin: 0 auto;
  }

  .scan__title {
    font-size: var(--font-size-title);
  }

  .scan__count {
    font-size: var(--font-size-display);
    font-weight: 700;
  }

  .scan__path {
    font-size: var(--font-size-secondary);
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scan__error {
    color: var(--color-danger);
    font-size: var(--font-size-body);
  }

  .scan__actions {
    margin-top: var(--space-16);
  }

  .button {
    height: var(--button-height);
    border-radius: var(--radius-button);
    border: none;
    font-size: var(--font-size-body);
    font-weight: 600;
    min-height: var(--touch-min);
    width: 100%;
  }

  .button--primary {
    background: var(--color-accent-primary);
    color: var(--color-background);
  }

  .button--secondary {
    background: var(--color-surface-elevated);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
</style>
