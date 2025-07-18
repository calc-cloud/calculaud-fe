import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Building2, Users, Target, Briefcase, UserCheck } from 'lucide-react';
import { Hierarchy } from '@/types/hierarchies';

interface HierarchyItem {
  id: number;
  type: 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';
  name: string;
  parentId?: number;
  fullPath: string;
  children?: HierarchyItem[];
}

interface HierarchySelectorProps {
  hierarchies: Hierarchy[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  singleSelect?: boolean; // New prop to control single vs multiple selection
}

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  hierarchies,
  selectedIds,
  onSelectionChange,
  singleSelect = false
}) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<number>>(new Set());

  // Transform backend hierarchy data to the format expected by the component
  const transformedHierarchies: HierarchyItem[] = hierarchies.map((hierarchy: Hierarchy) => ({
    id: hierarchy.id,
    type: hierarchy.type as 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team',
    name: hierarchy.name,
    parentId: hierarchy.parent_id || undefined,
    fullPath: hierarchy.path
  }));

  const getLabel = () => {
    if (selectedIds.length === 0) {
      return singleSelect ? 'Select hierarchy' : 'Hierarchy';
    }
    if (selectedIds.length === 1) {
      const selected = transformedHierarchies.find(h => h.id === selectedIds[0]);
      return selected ? selected.name : (singleSelect ? 'Select hierarchy' : 'Hierarchy');
    }
    return `${selectedIds.length} selected`;
  };

  const handleSelect = (hierarchyId: number) => {
    const isSelected = selectedIds.includes(hierarchyId);
    
    if (singleSelect) {
      // In single select mode, either select this item or deselect it
      if (isSelected) {
        onSelectionChange([]); // Deselect if already selected
      } else {
        onSelectionChange([hierarchyId]); // Select only this item
      }
    } else {
      // In multiple select mode, toggle selection
      if (isSelected) {
        onSelectionChange(selectedIds.filter(id => id !== hierarchyId));
      } else {
        onSelectionChange([...selectedIds, hierarchyId]);
      }
    }
  };

  const toggleExpanded = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking expand/collapse
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
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

  // Build tree structure from flat hierarchy list
  const buildTreeStructure = (items: HierarchyItem[]): HierarchyItem[] => {
    const itemMap = new Map<number, HierarchyItem>();
    const roots: HierarchyItem[] = [];

    // First pass: create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build parent-child relationships
    items.forEach(item => {
      const itemWithChildren = itemMap.get(item.id)!;
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(itemWithChildren);
      } else {
        roots.push(itemWithChildren);
      }
    });

    return roots;
  };

  const treeStructure = buildTreeStructure(transformedHierarchies);

  const renderTreeNode = (node: HierarchyItem, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const paddingLeft = level * 16;

    return (
      <div key={node.id}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => handleSelect(node.id)}
        >
          {hasChildren ? (
            <div 
              className="flex items-center mr-2"
              onClick={(e) => toggleExpanded(node.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ) : (
            <div className="w-6" />
          )}
          
          <Checkbox
            checked={selectedIds.includes(node.id)}
            className="mr-2"
          />
          
          {getTypeIcon(node.type)}
          
          <div className="flex-1 ml-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{node.name}</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                {node.type.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-left">
          <span className="truncate">{getLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[420px] max-h-[300px] overflow-y-auto bg-white border shadow-lg z-50 p-0"
        align="start" 
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={10}
      >
        <div className="py-2">
          {treeStructure.length > 0 ? (
            treeStructure.map(node => renderTreeNode(node))
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
