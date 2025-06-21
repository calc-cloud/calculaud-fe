
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PurposeFilters } from '@/types';
import { SortConfig, getSortDisplayName } from '@/utils/sorting';

interface ResultsSummaryProps {
  startIndex: number;
  endIndex: number;
  filteredCount: number;
  filters: PurposeFilters;
  sortConfig: SortConfig;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  startIndex,
  endIndex,
  filteredCount,
  filters,
  sortConfig
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredCount)} of {filteredCount} purposes
        </p>
        {Object.keys(filters).length > 0 && (
          <Badge variant="secondary">
            {Object.keys(filters).filter(key => filters[key as keyof PurposeFilters]).length} filters applied
          </Badge>
        )}
        <Badge variant="outline">
          Sorted by {getSortDisplayName(sortConfig.field)} ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
        </Badge>
      </div>
    </div>
  );
};
