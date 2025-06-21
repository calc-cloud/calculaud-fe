
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HierarchyItem {
  id: string;
  type: 'Unit' | 'Center' | 'Anaf' | 'Mador' | 'Team';
  name: string;
  parentId?: string;
  fullPath: string;
}

interface HierarchySelectorProps {
  hierarchies: HierarchyItem[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

interface TreeNode extends HierarchyItem {
  children: TreeNode[];
  expanded: boolean;
}

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  hierarchies,
  selectedIds,
  onSelectionChange
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build tree structure
  const buildTree = (items: HierarchyItem[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create all nodes
    items.forEach(item => {
      nodeMap.set(item.id, {
        ...item,
        children: [],
        expanded: expandedNodes.has(item.id)
      });
    });

    // Build parent-child relationships
    items.forEach(item => {
      const node = nodeMap.get(item.id)!;
      if (item.parentId && nodeMap.has(item.parentId)) {
        nodeMap.get(item.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(hierarchies);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleSelection = (nodeId: string) => {
    const newSelectedIds = selectedIds.includes(nodeId)
      ? selectedIds.filter(id => id !== nodeId)
      : [...selectedIds, nodeId];
    onSelectionChange(newSelectedIds);
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedIds.includes(node.id);

    return (
      <div key={node.id} className="select-none">
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer"
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          <div className="flex items-center space-x-1 flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
            
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelection(node.id)}
              className="mr-2"
            />
            
            <span className="text-sm">{node.name}</span>
            <span className="text-xs text-gray-400 ml-2">{node.type.toLowerCase()}</span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getLabel = () => {
    if (selectedIds.length === 0) return 'Select Organizational Units';
    if (selectedIds.length === 1) {
      const selected = hierarchies.find(h => h.id === selectedIds[0]);
      return selected ? selected.name : 'Select Organizational Units';
    }
    return `${selectedIds.length} units selected`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {getLabel()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[300px] max-h-[400px] overflow-y-auto bg-white border shadow-md z-50"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2 px-2">
            Select Organizational Units
          </div>
          <div className="text-xs text-gray-500 mb-3 px-2">
            Choose units, centers, anafs, madrors, or teams.
          </div>
          {tree.map(node => renderNode(node))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
