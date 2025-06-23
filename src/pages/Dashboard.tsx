
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ServicesQuantityChart } from '@/components/dashboard/ServicesQuantityChart';
import { analyticsService } from '@/services/analyticsService';
import { DashboardFilters as DashboardFiltersType } from '@/types/analytics';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFiltersType>({});

  console.log('=== Dashboard Filters ===', filters);

  const { data: servicesQuantityData, isLoading } = useQuery({
    queryKey: ['servicesQuantities', filters],
    queryFn: () => analyticsService.getServicesQuantities(filters),
    refetchOnWindowFocus: false,
  });

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
      <div className="grid grid-cols-1 gap-6">
        <ServicesQuantityChart 
          data={servicesQuantityData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
