<!--
  Screen: Onboarding / Permission
  Ref: WTFMF_ENGINEERING_SPEC.md §41, screen 01
  Rule: WTFMF_UI_UX_RULES.md §25 — explain value BEFORE requesting access.
  Never show a bare "Allow permission?" dialog as the first thing the user sees.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { permissionStore } from '$lib/stores/permissionStore';
  import { permissionService } from '$lib/bootstrap';
  import {
    checkPermissionOnLoad,
    requestFullStorageAccess,
    requestSafFolderAccess
  } from '$lib/usecases/permissionFlow';

  let requestingFull = false;
  let requestingSaf = false;

  onMount(async () => {
    await checkPermissionOnLoad(permissionService);
  });

  // Once usable access exists, move on — this screen's only job is getting there.
  $: if ($permissionStore.state === 'FULL' || $permissionStore.state === 'PARTIAL') {
    goto('/');
  }

  async function handleFullAccess() {
    requestingFull = true;
    try {
      await requestFullStorageAccess(permissionService);
    } finally {
      requestingFull = false;
    }
  }

  async function handleSafFolders() {
    requestingSaf = true;
    try {
      await requestSafFolderAccess(permissionService);
    } finally {
      requestingSaf = false;
    }
  }
</script>

<section class="onboarding">
  <h1 class="onboarding__title">Find out where your storage went.</h1>
  <p class="onboarding__explainer">
    To analyze your storage, WTFMF needs access to the files you choose to manage.
    Nothing leaves your device — analysis happens entirely on your phone.
  </p>

  <ul class="onboarding__benefits">
    <li>Find large files</li>
    <li>Detect duplicates</li>
    <li>Analyze folders</li>
    <li>Organize files</li>
  </ul>

  <div class="onboarding__actions">
    <button class="button button--primary" on:click={handleFullAccess} disabled={requestingFull}>
      {requestingFull ? 'Opening Settings…' : 'Manage All Files'}
    </button>
    <button class="button button--secondary" on:click={handleSafFolders} disabled={requestingSaf}>
      {requestingSaf ? 'Opening picker…' : 'Choose Folders Instead'}
    </button>
  </div>

  <p class="onboarding__note">
    <strong>Manage All Files</strong> lets WTFMF see your whole device storage.
    <strong>Choose Folders Instead</strong> limits it to only the folders you pick.
  </p>
</section>

<style>
  .onboarding {
    display: flex;
    flex-direction: column;
    gap: var(--space-20);
    padding: var(--space-24) var(--space-16);
    max-width: 480px;
    margin: 0 auto;
  }

  .onboarding__title {
    font-size: var(--font-size-title);
    line-height: 1.25;
  }

  .onboarding__explainer {
    color: var(--color-text-muted);
    font-size: var(--font-size-body);
  }

  .onboarding__benefits {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .onboarding__benefits li {
    display: flex;
    align-items: center;
    gap: var(--space-8);
  }

  .onboarding__benefits li::before {
    content: '✓';
    color: var(--color-positive);
  }

  .onboarding__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
    margin-top: var(--space-8);
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

  .button--secondary {
    background: var(--color-surface-elevated);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .button:disabled {
    opacity: 0.6;
  }

  .onboarding__note {
    font-size: var(--font-size-secondary);
    color: var(--color-text-muted);
  }
</style>
