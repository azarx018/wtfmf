import type { Category, FileCategoryAssignment } from '$lib/types/category';

export interface CategoryRepository {
  getTree(): Promise<Category[]>;
  create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  assign(assignment: FileCategoryAssignment): Promise<void>;
  unassign(fileId: number, categoryId: number): Promise<void>;
  getAssignmentsForFile(fileId: number): Promise<FileCategoryAssignment[]>;
  getStatsByCategory(): Promise<Array<{ categoryId: number; fileCount: number; totalSize: number }>>;
}
