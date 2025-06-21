
import { HierarchyType, HierarchyItem } from '@/types/hierarchy';
import { Building2, Building, Users, User, UserCheck } from 'lucide-react';

export const hierarchyTypes: HierarchyType[] = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];

export const getHierarchyIcon = (type: HierarchyType) => {
  switch (type) {
    case 'Unit':
      return Building2;
    case 'Center':
      return Building;
    case 'Anaf':
      return Users;
    case 'Mador':
      return User;
    case 'Team':
      return UserCheck;
    default:
      return Building2;
  }
};

export const getAvailableParentTypes = (type: HierarchyType): HierarchyType[] => {
  const typeOrder = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'];
  const currentIndex = typeOrder.indexOf(type);
  if (currentIndex === 0) return []; // Unit has no parent
  
  return typeOrder.slice(0, currentIndex) as HierarchyType[];
};

export const getParentOptions = (hierarchies: HierarchyItem[], parentType: HierarchyType) => {
  return hierarchies.filter(h => h.type === parentType);
};

export const buildFullPath = (name: string, parentId: string | undefined, hierarchies: HierarchyItem[]): string => {
  if (!parentId) return name;
  const parent = hierarchies.find(h => h.id === parentId);
  return parent ? `${parent.fullPath} > ${name}` : name;
};
