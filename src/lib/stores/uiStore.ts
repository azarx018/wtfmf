import { writable } from 'svelte/store';

interface Toast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
}

interface UiState {
  activeModal: string | null;
  activeBottomSheet: string | null;
  toasts: Toast[];
  globalLoading: boolean;
}

function createUiStore() {
  const { subscribe, update } = writable<UiState>({
    activeModal: null,
    activeBottomSheet: null,
    toasts: [],
    globalLoading: false
  });

  return {
    subscribe,
    openModal: (id: string) => update((s) => ({ ...s, activeModal: id })),
    closeModal: () => update((s) => ({ ...s, activeModal: null })),
    openBottomSheet: (id: string) => update((s) => ({ ...s, activeBottomSheet: id })),
    closeBottomSheet: () => update((s) => ({ ...s, activeBottomSheet: null })),
    pushToast: (toast: Omit<Toast, 'id'>) =>
      update((s) => ({ ...s, toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
    dismissToast: (id: string) => update((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) })),
    setGlobalLoading: (v: boolean) => update((s) => ({ ...s, globalLoading: v }))
  };
}

export const uiStore = createUiStore();
