import React, {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useSearchParams} from 'react-router-dom';
import {UnifiedDashboardFilters} from '@/components/dashboard/UnifiedDashboardFilters';
import {ServicesQuantityChart} from '@/components/dashboard/ServicesQuantityChart';
import {ServiceTypesDistributionChart} from '@/components/dashboard/ServiceTypesDistributionChart';
import {HierarchyDistributionChart} from '@/components/dashboard/HierarchyDistributionChart';
import {CostOverTimeChart} from '@/components/dashboard/CostOverTimeChart';
import {analyticsService} from '@/services/analyticsService';
import {DashboardFilters as DashboardFiltersType} from '@/types/analytics';
import {format, subYears} from 'date-fns';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Parse URL params to initial state
  const getInitialFilters = (): DashboardFiltersType => {
    const defaultFilters = getDefaultFilters();
    const filters: DashboardFiltersType = { ...defaultFilters };
    
    // Parse material IDs (service IDs)
    if (searchParams.get('material_id')) {
      const materialIds = searchParams.get('material_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (materialIds && materialIds.length > 0) {
        filters.service_id = materialIds;
      }
    }

    // Parse service type IDs
    if (searchParams.get('service_type_id')) {
      const serviceTypeIds = searchParams.get('service_type_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        filters.service_type_id = serviceTypeIds;
      }
    }

    // Parse hierarchy IDs
    if (searchParams.get('hierarchy_id')) {
      const hierarchyIds = searchParams.get('hierarchy_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (hierarchyIds && hierarchyIds.length > 0) {
        filters.hierarchy_id = hierarchyIds;
      }
    }

    // Parse supplier IDs
    if (searchParams.get('supplier_id')) {
      const supplierIds = searchParams.get('supplier_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (supplierIds && supplierIds.length > 0) {
        filters.supplier_id = supplierIds;
      }
    }

    // Parse status array
    if (searchParams.get('status')) {
      const statuses = searchParams.get('status')?.split(',');
      if (statuses && statuses.length > 0) {
        filters.status = statuses;
      }
    }

    // Parse date/time filters
    if (searchParams.get('start_date')) {
      filters.start_date = searchParams.get('start_date') || undefined;
    }
    if (searchParams.get('end_date')) {
      filters.end_date = searchParams.get('end_date') || undefined;
    }
    if (searchParams.get('relative_time')) {
      filters.relative_time = searchParams.get('relative_time') || undefined;
    }

    // Override with URL params only if they exist, otherwise keep defaults
    const hasDateTimeParams = searchParams.get('start_date') || searchParams.get('end_date') || searchParams.get('relative_time');
    if (!hasDateTimeParams) {
      // Keep the default values we already set
    }

    return filters;
  };

  const [filters, setFilters] = useState<DashboardFiltersType>(getInitialFilters());
  const [hierarchyLevel, setHierarchyLevel] = useState<'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null>(null);
  const [hierarchyParentId, setHierarchyParentId] = useState<number | null>(null);
  const [expenditureGroupBy, setExpenditureGroupBy] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add material IDs (service IDs)
    if (filters.service_id && filters.service_id.length > 0) {
      params.set('material_id', filters.service_id.join(','));
    }

    // Add service type IDs
    if (filters.service_type_id && filters.service_type_id.length > 0) {
      params.set('service_type_id', filters.service_type_id.join(','));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id && filters.hierarchy_id.length > 0) {
      params.set('hierarchy_id', filters.hierarchy_id.join(','));
    }

    // Add supplier IDs
    if (filters.supplier_id && filters.supplier_id.length > 0) {
      params.set('supplier_id', filters.supplier_id.join(','));
    }

    // Add status array
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }

    // Add date/time filters (always include these if they have values, including defaults)
    if (filters.start_date) {
      params.set('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.set('end_date', filters.end_date);
    }
    if (filters.relative_time) {
      params.set('relative_time', filters.relative_time);
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

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

  const { data: expenditureTimelineData, isLoading: isExpenditureTimelineLoading } = useQuery({
    queryKey: ['expenditureTimeline', filters, expenditureGroupBy],
    queryFn: () => analyticsService.getExpenditureTimeline(filters, expenditureGroupBy),
    refetchOnWindowFocus: false,
  });

  const handleHierarchyFiltersChange = (level?: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null, parent_id?: number | null) => {
    setHierarchyLevel(level ?? null);
    setHierarchyParentId(parent_id ?? null);
  };

  const handleExpenditureGroupByChange = (groupBy: 'day' | 'week' | 'month' | 'year') => {
    setExpenditureGroupBy(groupBy);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Global Filters */}
              <UnifiedDashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HierarchyDistributionChart 
          data={hierarchyDistributionData}
          isLoading={isHierarchyDistributionLoading}
          globalFilters={filters}
          onFiltersChange={handleHierarchyFiltersChange}
        />
        <ServiceTypesDistributionChart 
          data={serviceTypesDistributionData}
          isLoading={isServiceTypesDistributionLoading}
        />
      </div>

      {/* Second Row - Full Width Charts */}
      <div className="grid grid-cols-1 gap-6">
        <ServicesQuantityChart 
          data={servicesQuantityData}
          isLoading={isServicesQuantityLoading}
        />
        <CostOverTimeChart 
          data={expenditureTimelineData}
          isLoading={isExpenditureTimelineLoading}
          globalFilters={filters}
          onGroupByChange={handleExpenditureGroupByChange}
        />
      </div>
    </div>
  );
};

export default Dashboard;
