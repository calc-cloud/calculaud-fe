import React from 'react';

import {ActiveFiltersBadges} from '@/components/common/ActiveFiltersBadges';
import {ColumnVisibility} from '@/components/common/ColumnControl';
import {TablePagination} from '@/components/tables/TablePagination';
import {TanStackPurposeTable} from '@/components/tables/TanStackPurposeTable';
import {UnifiedFilters} from '@/types/filters';
import {ColumnSizing} from '@/utils/columnStorage';
import {SortConfig} from '@/utils/sorting';

interface SearchResultsProps {
  purposes: any[];
  isLoading: boolean;
  error: Error | null;
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
  columnVisibility: ColumnVisibility;
  columnSizing: ColumnSizing;
  onColumnSizingChange: (sizing: ColumnSizing) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  startIndex: number;
  endIndex: number;
  // Admin data for filter badges
  hierarchies: any[];
  serviceTypes: any[];
  suppliers: any[];
  materials: any[];
  responsibleAuthorities: any[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  purposes,
  isLoading,
  error,
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  columnVisibility,
  columnSizing,
  onColumnSizingChange,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  startIndex,
  endIndex,
  hierarchies,
  serviceTypes,
  suppliers,
  materials,
  responsibleAuthorities
}) => {
  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load purposes</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActiveFiltersBadges
        filters={filters}
        onFiltersChange={onFiltersChange}
        hierarchies={hierarchies}
        serviceTypes={serviceTypes}
        suppliers={suppliers}
        materials={materials}
        responsibleAuthorities={responsibleAuthorities}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount} purposes
          </p>
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

      <TanStackPurposeTable
        purposes={purposes}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        sortConfig={sortConfig}
        onSortChange={onSortChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
      />
    </div>
  );
};