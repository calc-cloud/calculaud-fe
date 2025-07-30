import React from 'react';

import {SearchHeader} from '@/components/search/SearchHeader';
import {SearchResults} from '@/components/search/SearchResults';
import {useAdminData} from '@/contexts/AdminDataContext';
import {useColumnState} from '@/hooks/useColumnState';
import {usePurposeData} from '@/hooks/usePurposeData';
import {useUrlParams} from '@/hooks/useUrlParams';
import {calculatePaginationIndices, countActiveFilters, SEARCH_CONSTANTS} from '@/utils/searchUtils';
import {SortConfig} from '@/utils/sorting';

const Search: React.FC = () => {
  // Initialize URL parameter hook
  const urlParams = useUrlParams({ 
    filters: {}, 
    sortConfig: { 
      field: SEARCH_CONSTANTS.DEFAULT_SORT_FIELD, 
      direction: SEARCH_CONSTANTS.DEFAULT_SORT_DIRECTION 
    }, 
    currentPage: 1 
  });

  // Get purpose data with URL-based initial state
  const {
    filteredPurposes,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    isLoading,
    error
  } = usePurposeData(
    urlParams.getInitialFilters(), 
    urlParams.getInitialSortConfig(), 
    urlParams.getInitialPage()
  );

  // Initialize URL synchronization with current state
  useUrlParams({ filters, sortConfig, currentPage });

  // Create sort change handler that resets to page 1
  const handleSortChange = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1);
  };

  // Get admin data for filter badges
  const {hierarchies, suppliers, serviceTypes, materials, responsibleAuthorities} = useAdminData();

  // Column state management
  const {columnVisibility, setColumnVisibility, columnSizing, setColumnSizing} = useColumnState();

  // Calculate pagination indices
  const {startIndex, endIndex} = calculatePaginationIndices(
    currentPage,
    SEARCH_CONSTANTS.ITEMS_PER_PAGE,
    filteredPurposes.length,
    totalCount
  );

  // Count active filters
  const activeFiltersCount = countActiveFilters(filters);
  return (
    <div className="space-y-6">
      <SearchHeader
        filters={filters}
        onFiltersChange={setFilters}
        sortConfig={sortConfig}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        activeFiltersCount={activeFiltersCount}
      />

      <SearchResults
        purposes={filteredPurposes}
        isLoading={isLoading}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        columnVisibility={columnVisibility}
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalCount={totalCount}
        startIndex={startIndex}
        endIndex={endIndex}
        hierarchies={hierarchies}
        serviceTypes={serviceTypes}
        suppliers={suppliers}
        materials={materials}
        responsibleAuthorities={responsibleAuthorities}
      />
    </div>
  );
};

export default Search;
