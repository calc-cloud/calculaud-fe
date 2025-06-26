import React from 'react';
import {UnifiedFilters} from '@/components/common/UnifiedFilters';
import {PurposeFilters} from '@/types/index';
import {purposeFiltersToUnified, unifiedToPurposeFilters} from '@/utils/filterAdapters';

interface SearchFilterBarProps {
  filters: PurposeFilters;
  onFiltersChange: (filters: PurposeFilters) => void;
  onExport: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  const handleFiltersChange = (unifiedFilters: any) => {
    const purposeFilters = unifiedToPurposeFilters(unifiedFilters);
    onFiltersChange(purposeFilters);
  };

  const config = {
    mode: 'search' as const,
    showExport: true,
    showSearch: true,
      showDateRange: true,
      hideBadges: true
  };

  return (
    <UnifiedFilters
      filters={purposeFiltersToUnified(filters)}
      onFiltersChange={handleFiltersChange}
      onExport={onExport}
      config={config}
    />
  );
}; 