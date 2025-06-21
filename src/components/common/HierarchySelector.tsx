
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HierarchyItem {
  id: string;
  type: 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';
  name: string;
  parentId?: string;
  fullPath: string;
  children?: HierarchyItem[];
}

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
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set(['Unit']));

  const getLabel = () => {
    if (selectedIds.length === 0) return 'Hierarchy';
    if (selectedIds.length === 1) {
      const selected = hierarchies.find(h => h.id === selectedIds[0]);
      return selected ? selected.name : 'Hierarchy';
    }
    return `${selectedIds.length} selected`;
  };

  const handleSelect = (hierarchyId: string) => {
    const isSelected = selectedIds.includes(hierarchyId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== hierarchyId));
    } else {
      onSelectionChange([...selectedIds, hierarchyId]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const toggleSection = (type: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(type)) {
      newOpenSections.delete(type);
    } else {
      newOpenSections.add(type);
    }
    setOpenSections(newOpenSections);
  };

  // Group hierarchies by type in a specific order
  const hierarchyTypes = ['Unit', 'Center', 'Anaf', 'Mador', 'Team'] as const;
  const groupedHierarchies = hierarchyTypes.reduce((acc, type) => {
    const items = hierarchies.filter(h => h.type === type);
    if (items.length > 0) {
      acc[type] = items;
    }
    return acc;
  }, {} as Record<string, HierarchyItem[]>);

  const renderHierarchyGroup = (type: string, items: HierarchyItem[]) => {
    const isOpen = openSections.has(type);
    
    return (
      <Collapsible key={type} open={isOpen} onOpenChange={() => toggleSection(type)}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-gray-50 rounded">
          <span>{type}</span>
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-2">
          {items.map(hierarchy => (
            <DropdownMenuItem
              key={hierarchy.id}
              className="cursor-pointer flex items-center space-x-2 py-1 ml-2"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                checked={selectedIds.includes(hierarchy.id)}
                onCheckedChange={() => handleSelect(hierarchy.id)}
              />
              <span className="flex-1 text-sm">{hierarchy.name}</span>
            </DropdownMenuItem>
          ))}
        </CollapsibleContent>
      </Collapsible>
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
      <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto bg-white border shadow-md z-50">
        <DropdownMenuItem
          className="cursor-pointer font-medium border-b"
          onClick={clearAll}
        >
          Clear All
        </DropdownMenuItem>
        
        <div className="py-2">
          {Object.entries(groupedHierarchies).map(([type, items]) => 
            renderHierarchyGroup(type, items)
          )}
        </div>
        
        {Object.keys(groupedHierarchies).length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No hierarchies available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
