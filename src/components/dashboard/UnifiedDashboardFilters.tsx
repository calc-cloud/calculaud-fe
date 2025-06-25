import React from 'react';
import { UnifiedFilters } from '@/components/common/UnifiedFilters';
import { DashboardFilters } from '@/types/analytics';
import { dashboardFiltersToUnified, unifiedToDashboardFilters } from '@/utils/filterAdapters';

interface UnifiedDashboardFiltersProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export const UnifiedDashboardFilters: React.FC<UnifiedDashboardFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFiltersChange = (unifiedFilters: any) => {
    const dashboardFilters = unifiedToDashboardFilters(unifiedFilters);
    onFiltersChange(dashboardFilters);
  };

  const config = {
    mode: 'dashboard' as const,
    showExport: false,
    showSearch: false,
    showDateRange: true
  };

  return (
    <UnifiedFilters
      filters={dashboardFiltersToUnified(filters)}
      onFiltersChange={handleFiltersChange}
      config={config}
    />
  );
}; 