import React from 'react';
import {Badge} from '@/components/ui/badge';
import {PurposeFilters} from '@/types';
import {SortConfig} from '@/utils/sorting';
import {TablePagination} from '@/components/tables/TablePagination';

interface ResultsSummaryProps {
  startIndex: number;
  endIndex: number;
  filteredCount: number;
  filters: PurposeFilters;
  sortConfig: SortConfig;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  startIndex,
  endIndex,
  filteredCount,
  filters,
  sortConfig,
  currentPage,
  totalPages,
                                                                onPageChange,
                                                                isLoading = false
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
      </div>
      
      <div className="flex-shrink-0">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
