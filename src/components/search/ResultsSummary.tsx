
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TablePagination } from '@/components/tables/TablePagination';
import { PurposeFilters } from '@/types';
import { SortConfig, getSortDisplayName } from '@/utils/sorting';

interface ResultsSummaryProps {
  startIndex: number;
  endIndex: number;
  filteredCount: number;
  filters: PurposeFilters;
  sortConfig: SortConfig;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  startIndex,
  endIndex,
  filteredCount,
  filters,
  sortConfig,
  currentPage,
  totalPages,
  onPageChange
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
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
