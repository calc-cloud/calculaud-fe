
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={sortConfig.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-48 focus-visible:outline-none">
            <SelectValue placeholder="Select sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creation_time">Creation Time</SelectItem>
            <SelectItem value="expected_delivery">Expected Delivery</SelectItem>
            <SelectItem value="last_modified">Last Modified</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDirectionToggle}
          className="h-10 w-10 p-0 focus-visible:outline-none"
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
