
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortConfig, SortField, SortDirection } from '@/utils/sorting';

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({ sortConfig, onSortChange }) => {
  const handleFieldChange = (field: SortField) => {
    onSortChange({ field, direction: sortConfig.direction });
  };

  const handleDirectionToggle = () => {
    const newDirection: SortDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field: sortConfig.field, direction: newDirection });
  };

  const getFieldDisplayName = (field: SortField) => {
    switch (field) {
      case 'creation_time':
        return 'Creation Time';
      case 'expected_delivery':
        return 'Expected Delivery';
      case 'last_modified':
        return 'Last Modified';
      default:
        return field;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={sortConfig.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-48 border-0 shadow-none">
            <SelectValue placeholder="Select sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creation_time">Creation Time</SelectItem>
            <SelectItem value="expected_delivery">Expected Delivery</SelectItem>
            <SelectItem value="last_modified">Last Modified</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDirectionToggle}
          className="h-10 w-10 p-0 border"
          title={sortConfig.direction === 'desc' ? 'Newest first' : 'Oldest first'}
        >
          {sortConfig.direction === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
