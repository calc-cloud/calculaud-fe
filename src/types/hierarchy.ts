
export type HierarchyType = 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';

export interface HierarchyItem {
  id: string;
  type: HierarchyType;
  name: string;
  parentId?: string;
  fullPath: string;
}
