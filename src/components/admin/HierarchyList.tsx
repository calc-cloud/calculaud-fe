
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { HierarchyItem } from '@/types/hierarchy';

interface HierarchyListProps {
  hierarchies: HierarchyItem[];
  onEdit: (hierarchy: HierarchyItem) => void;
  onDelete: (hierarchy: HierarchyItem) => void;
}

export const HierarchyList: React.FC<HierarchyListProps> = ({
  hierarchies,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-2">
      {hierarchies.map(hierarchy => (
        <div key={hierarchy.id} className="flex items-center justify-between p-3 border rounded text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{hierarchy.fullPath}</p>
            <p className="text-xs text-gray-500 mt-1">Type: {hierarchy.type}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(hierarchy)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(hierarchy)} className="text-red-600">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};
