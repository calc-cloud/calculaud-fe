
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Building2, Users, Target, Briefcase, UserCheck } from 'lucide-react';

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
  // Debug logging
  React.useEffect(() => {
    console.log('HierarchySelector received hierarchies:', hierarchies);
    hierarchies.forEach(h => {
      console.log(`Hierarchy ID ${h.id}: name="${h.name}", fullPath="${h.fullPath}"`);
    });
  }, [hierarchies]);

  const getLabel = () => {
    if (selectedIds.length === 0) return 'Hierarchy';
    if (selectedIds.length === 1) {
      const selected = hierarchies.find(h => h.id === selectedIds[0]);
      return selected ? selected.fullPath : 'Hierarchy';
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

  // Calculate indentation level based on path depth
  const getIndentationLevel = (fullPath: string) => {
    return (fullPath.split(' / ').length - 1) * 16;
  };

  // Sort hierarchies by their full path to maintain proper order
  const sortedHierarchies = [...hierarchies].sort((a, b) => a.fullPath.localeCompare(b.fullPath));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-between text-left">
          <span className="truncate">{getLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[450px] max-h-[400px] overflow-y-auto bg-white border shadow-lg z-50 p-0">
        <div className="py-2">
          {sortedHierarchies.length > 0 ? (
            sortedHierarchies.map(hierarchy => {
              const indentLevel = getIndentationLevel(hierarchy.fullPath);
              console.log(`Rendering hierarchy ${hierarchy.id}: fullPath="${hierarchy.fullPath}", indent=${indentLevel}`);
              
              return (
                <div key={hierarchy.id}>
                  <div 
                    className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer"
                    style={{ paddingLeft: `${indentLevel + 8}px` }}
                  >
                    <Checkbox
                      checked={selectedIds.includes(hierarchy.id)}
                      onCheckedChange={() => handleSelect(hierarchy.id)}
                      className="mr-2"
                    />
                    
                    {getTypeIcon(hierarchy.type)}
                    
                    <div className="flex-1 ml-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{hierarchy.fullPath}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                          {hierarchy.type.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">
              No organizational units available
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
