import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { InlineFilters } from "@/components/common/UnifiedFilters";
import { ChartBlock } from "@/components/dashboard/ChartBlock";
import { PendingAuthoritiesDistributionChart } from "@/components/dashboard/PendingAuthoritiesDistributionChart";
import { PendingStagesDistributionChart } from "@/components/dashboard/PendingStagesDistributionChart";
import { ServicesQuantityChart } from "@/components/dashboard/ServicesQuantityChart";
import { ServiceTypesDistributionChart } from "@/components/dashboard/ServiceTypesDistributionChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { analyticsService } from "@/services/analyticsService";
import { DashboardFilters as DashboardFiltersType } from "@/types/analytics";
import { dashboardFiltersToUnified, unifiedToDashboardFilters } from "@/utils/filterAdapters";
import { clearFilters } from "@/utils/filterUtils";

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

    // Parse material IDs (service IDs)
    if (searchParams.get("material_id")) {
      const materialIds = searchParams
        .get("material_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (materialIds && materialIds.length > 0) {
        filters.service_id = materialIds;
      }
    }

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

    // Parse hierarchy IDs
    if (searchParams.get("hierarchy_id")) {
      const hierarchyIds = searchParams
        .get("hierarchy_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (hierarchyIds && hierarchyIds.length > 0) {
        filters.hierarchy_id = hierarchyIds;
      }
    }

    // Parse supplier IDs
    if (searchParams.get("supplier_id")) {
      const supplierIds = searchParams
        .get("supplier_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (supplierIds && supplierIds.length > 0) {
        filters.supplier_id = supplierIds;
      }
    }

    // Parse status array
    if (searchParams.get("status")) {
      const statuses = searchParams.get("status")?.split(",");
      if (statuses && statuses.length > 0) {
        filters.status = statuses;
      }
    }

    // Parse pending authority IDs
    if (searchParams.get("pending_authority_id")) {
      const pendingAuthorityIds = searchParams
        .get("pending_authority_id")
        ?.split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (pendingAuthorityIds && pendingAuthorityIds.length > 0) {
        filters.pending_authority_id = pendingAuthorityIds;
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

    // Parse flagged filter
    if (searchParams.get("flagged")) {
      filters.flagged = searchParams.get("flagged") === "true";
    }

    // Override with URL params only if they exist, otherwise keep defaults
    const hasDateTimeParams =
      searchParams.get("start_date") || searchParams.get("end_date") || searchParams.get("relative_time");
    if (!hasDateTimeParams) {
      // Keep the default values we already set
    }

    return filters;
  };

  const [filters, setFilters] = useState<DashboardFiltersType>(getInitialFilters());

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add material IDs (service IDs)
    if (filters.service_id && filters.service_id.length > 0) {
      params.set("material_id", filters.service_id.join(","));
    }

    // Add service type IDs
    if (filters.service_type_id && filters.service_type_id.length > 0) {
      params.set("service_type_id", filters.service_type_id.join(","));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id && filters.hierarchy_id.length > 0) {
      params.set("hierarchy_id", filters.hierarchy_id.join(","));
    }

    // Add supplier IDs
    if (filters.supplier_id && filters.supplier_id.length > 0) {
      params.set("supplier_id", filters.supplier_id.join(","));
    }

    // Add status array
    if (filters.status && filters.status.length > 0) {
      params.set("status", filters.status.join(","));
    }

    // Add pending authority IDs
    if (filters.pending_authority_id && filters.pending_authority_id.length > 0) {
      params.set("pending_authority_id", filters.pending_authority_id.join(","));
    }

    // Add date/time filters (always include these if they have values, including defaults)
    if (filters.start_date) {
      params.set("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.set("end_date", filters.end_date);
    }
    if (filters.relative_time) {
      params.set("relative_time", filters.relative_time);
    }
    // Add flagged filter
    if (filters.flagged === true) {
      params.set("flagged", "true");
    }

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { data: servicesQuantityData, isLoading: isServicesQuantityLoading } = useQuery({
    queryKey: ["servicesQuantities", filters],
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

  const unifiedFilters = dashboardFiltersToUnified(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Inline Filters - only time and service types */}
      <InlineFilters
        filters={unifiedFilters}
        onFiltersChange={(unifiedFilters) => {
          const dashboardFilters = unifiedToDashboardFilters(unifiedFilters);
          setFilters(dashboardFilters);
        }}
        onClearFilters={() => clearFilters((unified) => setFilters(unifiedToDashboardFilters(unified)), unifiedFilters)}
        visibleFilters={{
          showTime: true,
          showServiceTypes: true,
          showHierarchy: false,
          showMaterials: false,
          showSuppliers: false,
          showStatus: false,
          showPendingAuthority: false,
          showFlagged: false,
        }}
      />

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
          themeColor="green"
          description="Service quantities and cost analysis over time"
        >
          <div className="col-span-3 border border-gray-200 rounded-lg p-4 bg-white">
            <ServicesQuantityChart data={servicesQuantityData} isLoading={isServicesQuantityLoading} />
          </div>
        </ChartBlock>
      </div>
    </div>
  );
};

export default Dashboard;
