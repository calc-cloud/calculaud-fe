
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { HierarchyItem } from '@/types';

interface HierarchySelectorProps {
  hierarchies: HierarchyItem[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  hierarchies,
  selectedIds,
  onSelectionChange
}) => {
  const selectedHierarchy = selectedIds.length > 0 
    ? hierarchies.find(h => h.id === selectedIds[0])
    : null;

  const getLabel = () => {
    if (selectedHierarchy) {
      return selectedHierarchy.name;
    }
    return 'Hierarchy';
  };

  const handleSelect = (hierarchyId: string) => {
    onSelectionChange([hierarchyId]);
  };

  const renderHierarchy = (hierarchy: HierarchyItem, level: number = 0) => {
    const padding = level * 16;
    
    return (
      <React.Fragment key={hierarchy.id}>
        <DropdownMenuItem
          className="cursor-pointer"
          style={{ paddingLeft: `${8 + padding}px` }}
          onClick={() => handleSelect(hierarchy.id)}
        >
          {hierarchy.name}
        </DropdownMenuItem>
        {hierarchy.children?.map(child => renderHierarchy(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {getLabel()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px] max-h-[300px] overflow-y-auto bg-white border shadow-md z-50">
        <DropdownMenuItem
          className="cursor-pointer font-medium"
          onClick={() => onSelectionChange([])}
        >
          All Hierarchies
        </DropdownMenuItem>
        {hierarchies.map(hierarchy => renderHierarchy(hierarchy))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
