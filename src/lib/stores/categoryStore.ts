import { writable } from 'svelte/store';
import type { Category } from '$lib/types/category';

interface CategoryStoreState {
  tree: Category[];
  statsByCategory: Record<number, { fileCount: number; totalSize: number }>;
  loading: boolean;
}

function createCategoryStore() {
  const { subscribe, set, update } = writable<CategoryStoreState>({
    tree: [],
    statsByCategory: {},
    loading: false
  });

  return {
    subscribe,
    setTree: (tree: Category[]) => update((s) => ({ ...s, tree })),
    setStats: (stats: Record<number, { fileCount: number; totalSize: number }>) =>
      update((s) => ({ ...s, statsByCategory: stats })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, loading }))
  };
}

export const categoryStore = createCategoryStore();
