import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardFilters, PendingAuthorityDistributionItem } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getEntityColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface PendingAuthoritiesDistributionChartProps {
  data?: PendingAuthorityDistributionItem[];
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

export const PendingAuthoritiesDistributionChart: React.FC<PendingAuthoritiesDistributionChartProps> = ({
  data = [],
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for recharts and calculate total
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.authority_name,
      value: item.count,
      authorityId: item.authority_id,
      color: getEntityColor(item.authority_id, item.authority_name),
    }));
  }, [data]);

  // Calculate total count
  const totalCount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Handle clicking on a pie segment
  const handleSegmentClick = (data: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // For Live Operations, exclude COMPLETED status from search results
    const nonCompletedStatuses = ["In Progress", "Signed", "Partially Supplied"];

    // Add the clicked pending authority to the filters (only if not null) and exclude COMPLETED status
    const updatedFilters = {
      ...unifiedFilters,
      pending_authority: data.authorityId ? [data.authorityId] : undefined,
      status: nonCompletedStatuses, // Always exclude COMPLETED status for live operations
    };

    // Build search URL with filters
    const searchParams = new URLSearchParams();

    if (updatedFilters.relative_time) {
      searchParams.set("relative_time", updatedFilters.relative_time);
    }
    if (updatedFilters.start_date) {
      searchParams.set("start_date", updatedFilters.start_date);
    }
    if (updatedFilters.end_date) {
      searchParams.set("end_date", updatedFilters.end_date);
    }
    if (updatedFilters.service_type && updatedFilters.service_type.length > 0) {
      searchParams.set("service_type_id", updatedFilters.service_type.join(","));
    }
    if (updatedFilters.status && updatedFilters.status.length > 0) {
      searchParams.set("status", updatedFilters.status.join(","));
    }
    if (updatedFilters.pending_authority && updatedFilters.pending_authority.length > 0) {
      searchParams.set("pending_authority_id", updatedFilters.pending_authority.join(","));
    }

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Authority: ${data.name}`}</p>
          <p className="text-gray-600">{`Purposes: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend with percentages for right-side layout
  const renderCustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-col space-y-3">
        {payload.map((entry: any, index: number) => {
          const percentage = totalCount > 0 ? ((entry.value / totalCount) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-medium truncate" title={entry.name}>
                  {entry.name}
                </span>
              </div>
              <div className="text-xs text-gray-600 ml-5">
                {entry.value} ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Authorities Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Authorities Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No pending authority data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pending Authorities Distribution</h3>
      </div>

      {/* Chart Content */}
      <div className="flex-1 flex items-center">
        {/* Chart Container */}
        <div className="flex-1 h-full flex items-center justify-center">
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={handleSegmentClick}
                  className="cursor-pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend Container */}
        <div className="w-48 pl-6">{renderCustomLegend({ payload: chartData })}</div>
      </div>
    </div>
  );
};
