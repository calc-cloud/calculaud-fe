
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Building2, Users, Target, Briefcase, UserCheck } from 'lucide-react';

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
    if (selectedIds.length === 0) return 'Select Organizational Units';
    if (selectedIds.length === 1) {
      const selected = hierarchies.find(h => h.id === selectedIds[0]);
      return selected ? selected.name : 'Select Organizational Units';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Unit':
        return <Building2 className="h-4 w-4" />;
      case 'Center':
        return <Users className="h-4 w-4" />;
      case 'Anaf':
        return <Target className="h-4 w-4" />;
      case 'Mador':
        return <Briefcase className="h-4 w-4" />;
      case 'Team':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
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
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 rounded border-b border-gray-100">
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            {getTypeIcon(type)}
            <span className="font-medium text-gray-700">{type.toLowerCase()}</span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6">
          {items.map(hierarchy => (
            <DropdownMenuItem
              key={hierarchy.id}
              className="cursor-pointer flex items-center space-x-3 py-2 px-3 hover:bg-blue-50"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                checked={selectedIds.includes(hierarchy.id)}
                onCheckedChange={() => handleSelect(hierarchy.id)}
              />
              {getTypeIcon(hierarchy.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{hierarchy.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {hierarchy.type.toLowerCase()}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-between text-left">
          <span className="truncate">{getLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[350px] max-h-[400px] overflow-y-auto bg-white border shadow-lg z-50 p-0">
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Select Organizational Units</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Choose units, centers, anafs, madofs, or teams.</p>
        </div>
        
        <div className="py-2">
          {Object.entries(groupedHierarchies).map(([type, items]) => 
            renderHierarchyGroup(type, items)
          )}
        </div>
        
        {Object.keys(groupedHierarchies).length === 0 && (
          <div className="px-4 py-8 text-sm text-gray-500 text-center">
            No organizational units available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
