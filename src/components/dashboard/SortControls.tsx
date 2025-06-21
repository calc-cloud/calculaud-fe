
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { SortConfig, SortField, SortDirection } from '@/utils/sorting';

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({ sortConfig, onSortChange }) => {
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    onSortChange({ field, direction });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={`${sortConfig.field}-${sortConfig.direction}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creation_time-desc">Creation Time (Newest First)</SelectItem>
            <SelectItem value="creation_time-asc">Creation Time (Oldest First)</SelectItem>
            <SelectItem value="expected_delivery-asc">Expected Delivery (Earliest First)</SelectItem>
            <SelectItem value="expected_delivery-desc">Expected Delivery (Latest First)</SelectItem>
            <SelectItem value="last_modified-desc">Last Modified (Recent First)</SelectItem>
            <SelectItem value="last_modified-asc">Last Modified (Oldest First)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
