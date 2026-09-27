export interface TrashItem {
  id: number;
  fileId: number | null; // null if the original files row was pruned
  originalUri: string;
  trashUri: string | null;
  size: number;
  deletedAt: number;
}
