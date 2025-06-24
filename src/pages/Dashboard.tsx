
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ServicesQuantityChart } from '@/components/dashboard/ServicesQuantityChart';
import { ServiceTypesDistributionChart } from '@/components/dashboard/ServiceTypesDistributionChart';
import { HierarchyDistributionChart } from '@/components/dashboard/HierarchyDistributionChart';
import { analyticsService } from '@/services/analyticsService';
import { DashboardFilters as DashboardFiltersType } from '@/types/analytics';
import { format, subYears } from 'date-fns';

const Dashboard: React.FC = () => {
  // Set default filters with "Last Year" relative time
  const getDefaultFilters = (): DashboardFiltersType => {
    const today = new Date();
    const lastYear = subYears(today, 1);
    
    return {
      relative_time: 'last_year',
      start_date: format(lastYear, 'yyyy-MM-dd'),
      end_date: format(today, 'yyyy-MM-dd')
    };
  };

  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultFilters());
  const [hierarchyLevel, setHierarchyLevel] = useState<'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null>(null);
  const [hierarchyParentId, setHierarchyParentId] = useState<number | null>(null);

  const { data: servicesQuantityData, isLoading: isServicesQuantityLoading } = useQuery({
    queryKey: ['servicesQuantities', filters],
    queryFn: () => analyticsService.getServicesQuantities(filters),
    refetchOnWindowFocus: false,
  });

  const { data: serviceTypesDistributionData, isLoading: isServiceTypesDistributionLoading } = useQuery({
    queryKey: ['serviceTypesDistribution', filters],
    queryFn: () => analyticsService.getServiceTypesDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: hierarchyDistributionData, isLoading: isHierarchyDistributionLoading } = useQuery({
    queryKey: ['hierarchyDistribution', filters, hierarchyLevel, hierarchyParentId],
    queryFn: () => analyticsService.getHierarchyDistribution(filters, hierarchyLevel, hierarchyParentId),
    refetchOnWindowFocus: false,
  });

  const handleHierarchyFiltersChange = (level?: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null, parent_id?: number | null) => {
    setHierarchyLevel(level ?? null);
    setHierarchyParentId(parent_id ?? null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Global Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicesQuantityChart 
          data={servicesQuantityData}
          isLoading={isServicesQuantityLoading}
        />
        <ServiceTypesDistributionChart 
          data={serviceTypesDistributionData}
          isLoading={isServiceTypesDistributionLoading}
        />
      </div>

      {/* Third Chart - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <HierarchyDistributionChart 
          data={hierarchyDistributionData}
          isLoading={isHierarchyDistributionLoading}
          globalFilters={filters}
          onFiltersChange={handleHierarchyFiltersChange}
        />
      </div>
    </div>
  );
};

export default Dashboard;
