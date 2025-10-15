import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { InlineFilters, MinimizedFilters } from "@/components/common/UnifiedFilters";
import { BudgetSourceDistributionChart } from "@/components/dashboard/BudgetSourceDistributionChart";
import { ChartBlock } from "@/components/dashboard/ChartBlock";
import { PendingAuthoritiesDistributionChart } from "@/components/dashboard/PendingAuthoritiesDistributionChart";
import { PendingStagesDistributionChart } from "@/components/dashboard/PendingStagesDistributionChart";
import { PurposeProcessingTimesChart } from "@/components/dashboard/PurposeProcessingTimesChart";
import { MaterialQuantitiesChart } from "@/components/dashboard/ServiceQuantitiesChart";
import { ServiceTypeCostsDistributionChart } from "@/components/dashboard/ServiceTypeCostsDistributionChart";
import { ServiceTypesDistributionChart } from "@/components/dashboard/ServiceTypesDistributionChart";
import { ServiceTypesPerformanceChart } from "@/components/dashboard/ServiceTypesPerformanceChart";
import { StageProcessingTimesChart } from "@/components/dashboard/StageProcessingTimesChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { useAutoHideFilters } from "@/hooks/useAutoHideFilters";
import { analyticsService } from "@/services/analyticsService";
import { DashboardFilters as DashboardFiltersType } from "@/types/analytics";
import { dashboardFiltersToUnified, unifiedToDashboardFilters } from "@/utils/filterAdapters";
import { clearFilters } from "@/utils/filterUtils";

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isVisible, handleMouseEnter, handleMouseLeave } = useAutoHideFilters();

  // Set default filters with "All Time" relative time
  const getDefaultFilters = (): DashboardFiltersType => {
    return {
      relative_time: "all_time",
      // No start_date or end_date for "All Time"
    };
  };

  // Parse URL params to initial state
  const getInitialFilters = (): DashboardFiltersType => {
    const defaultFilters = getDefaultFilters();
    const filters: DashboardFiltersType = { ...defaultFilters };

    // Parse service type IDs
    if (searchParams.get("service_type_id")) {
      const serviceTypeIds = searchParams
        .get("service_type_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        filters.service_type_id = serviceTypeIds;
      }
    }

    // Parse date/time filters
    if (searchParams.get("start_date")) {
      filters.start_date = searchParams.get("start_date") || undefined;
    }
    if (searchParams.get("end_date")) {
      filters.end_date = searchParams.get("end_date") || undefined;
    }
    if (searchParams.get("relative_time")) {
      filters.relative_time = searchParams.get("relative_time") || undefined;
    }

    return filters;
  };

  const [filters, setFilters] = useState<DashboardFiltersType>(getInitialFilters());

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add service type IDs
    if (filters.service_type_id && filters.service_type_id.length > 0) {
      params.set("service_type_id", filters.service_type_id.join(","));
    }

    // Add date/time filters
    if (filters.start_date) {
      params.set("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.set("end_date", filters.end_date);
    }
    if (filters.relative_time) {
      params.set("relative_time", filters.relative_time);
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data: serviceQuantitiesData, isLoading: isServiceQuantitiesLoading } = useQuery({
    queryKey: ["serviceQuantities", filters],
    queryFn: () => analyticsService.getServicesQuantities(filters),
    refetchOnWindowFocus: false,
  });

  const { data: serviceTypesDistributionData, isLoading: isServiceTypesDistributionLoading } = useQuery({
    queryKey: ["serviceTypesDistribution", filters],
    queryFn: () => analyticsService.getServiceTypesDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: statusDistributionData, isLoading: isStatusDistributionLoading } = useQuery({
    queryKey: ["statusDistribution", filters],
    queryFn: () => analyticsService.getStatusesDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: pendingAuthoritiesDistributionData, isLoading: isPendingAuthoritiesDistributionLoading } = useQuery({
    queryKey: ["pendingAuthoritiesDistribution", filters],
    queryFn: () => analyticsService.getPendingAuthoritiesDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: pendingStagesDistributionData, isLoading: isPendingStagesDistributionLoading } = useQuery({
    queryKey: ["pendingStagesDistribution", filters],
    queryFn: () => analyticsService.getPendingStagesDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: serviceTypesPerformanceSignedData, isLoading: isServiceTypesPerformanceSignedLoading } = useQuery({
    queryKey: ["serviceTypesPerformanceSigned", filters],
    queryFn: () => analyticsService.getServiceTypesPerformanceDistribution("SIGNED", filters),
    refetchOnWindowFocus: false,
  });

  const { data: serviceTypesPerformanceCompletedData, isLoading: isServiceTypesPerformanceCompletedLoading } = useQuery(
    {
      queryKey: ["serviceTypesPerformanceCompleted", filters],
      queryFn: () => analyticsService.getServiceTypesPerformanceDistribution("COMPLETED", filters),
      refetchOnWindowFocus: false,
    }
  );

  const { data: budgetSourceDistributionData, isLoading: isBudgetSourceDistributionLoading } = useQuery({
    queryKey: ["budgetSourceDistribution", filters],
    queryFn: () => analyticsService.getBudgetSourceDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: serviceTypeCostsDistributionData, isLoading: isServiceTypeCostsDistributionLoading } = useQuery({
    queryKey: ["serviceTypeCostsDistribution", filters],
    queryFn: () => analyticsService.getServiceTypeCostsDistribution(filters),
    refetchOnWindowFocus: false,
  });

  const { data: processingTimesData, isLoading: isProcessingTimesLoading } = useQuery({
    queryKey: ["processingTimes", filters],
    queryFn: () => analyticsService.getProcessingTimes(filters),
    refetchOnWindowFocus: false,
  });

  const { data: stageProcessingTimesData, isLoading: isStageProcessingTimesLoading } = useQuery({
    queryKey: ["stageProcessingTimes", filters],
    queryFn: () => analyticsService.getStageProcessingTimes(filters),
    refetchOnWindowFocus: false,
  });

  const unifiedFilters = dashboardFiltersToUnified(filters);

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.relative_time && filters.relative_time !== "all_time") count++;
    if (filters.service_type_id && filters.service_type_id.length > 0) count += filters.service_type_id.length;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Auto-Hide Floating Filters Container */}
      <div className="fixed top-14 left-0 right-0 z-40 flex justify-center">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isVisible ? "w-auto max-w-7xl" : "flex justify-center"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isVisible ? (
            <InlineFilters
              filters={unifiedFilters}
              onFiltersChange={(unifiedFilters) => {
                const dashboardFilters = unifiedToDashboardFilters(unifiedFilters);
                setFilters(dashboardFilters);
              }}
              onClearFilters={() => {
                clearFilters((unified) => setFilters(unifiedToDashboardFilters(unified)), unifiedFilters);
              }}
              visibleFilters={{
                showTime: true,
                showServiceTypes: true,
                showHierarchy: false,
                showMaterials: false,
                showSuppliers: false,
                showStatus: false,
                showPendingAuthority: false,
                showBudgetSources: false,
                showFlagged: false,
              }}
            />
          ) : (
            <MinimizedFilters activeFiltersCount={activeFiltersCount} />
          )}
        </div>
      </div>

      {/* Chart Blocks */}
      <div className="space-y-6">
        {/* Live Operations Block */}
        <ChartBlock
          title="Live Operations"
          themeColor="orange"
          description={
            <div className="space-y-1">
              <p className="text-base font-semibold">Real-time data of active purposes</p>
              <p>Note: Time filters do not apply to live operations charts.</p>
            </div>
          }
          className="mt-2"
        >
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <StatusDistributionChart
              data={statusDistributionData?.data}
              isLoading={isStatusDistributionLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <ServiceTypesDistributionChart
              data={serviceTypesDistributionData}
              isLoading={isServiceTypesDistributionLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <PendingAuthoritiesDistributionChart
              data={pendingAuthoritiesDistributionData?.data}
              isLoading={isPendingAuthoritiesDistributionLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-3 border border-gray-200 rounded-lg p-4 bg-white">
            <PendingStagesDistributionChart
              data={pendingStagesDistributionData?.data}
              isLoading={isPendingStagesDistributionLoading}
              globalFilters={filters}
            />
          </div>
        </ChartBlock>

        {/* Performance Analytics Block */}
        <ChartBlock
          title="Performance Analytics"
          themeColor="blue"
          description="Material quantities and resource allocation across different service types"
        >
          <div className="col-span-3 border border-gray-200 rounded-lg p-4 bg-white">
            <MaterialQuantitiesChart
              data={serviceQuantitiesData}
              isLoading={isServiceQuantitiesLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <ServiceTypesPerformanceChart
              data={{
                signed: serviceTypesPerformanceSignedData,
                completed: serviceTypesPerformanceCompletedData,
              }}
              isLoading={isServiceTypesPerformanceSignedLoading || isServiceTypesPerformanceCompletedLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-2 border border-gray-200 rounded-lg p-4 bg-white">
            <PurposeProcessingTimesChart
              data={processingTimesData}
              isLoading={isProcessingTimesLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-3 row-span-2 border border-gray-200 rounded-lg p-4 bg-white">
            <StageProcessingTimesChart
              data={stageProcessingTimesData}
              isLoading={isStageProcessingTimesLoading}
              globalFilters={filters}
            />
          </div>
        </ChartBlock>

        {/* Cost Analytics Block */}
        <ChartBlock
          title="Cost Analytics"
          themeColor="green"
          description="Cost breakdown by budget sources and service types"
        >
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <BudgetSourceDistributionChart
              data={budgetSourceDistributionData}
              isLoading={isBudgetSourceDistributionLoading}
              globalFilters={filters}
            />
          </div>
          <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-white">
            <ServiceTypeCostsDistributionChart
              data={serviceTypeCostsDistributionData}
              isLoading={isServiceTypeCostsDistributionLoading}
              globalFilters={filters}
            />
          </div>
        </ChartBlock>
      </div>
    </div>
  );
};

export default Dashboard;
