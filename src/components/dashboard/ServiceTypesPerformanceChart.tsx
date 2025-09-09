import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardFilters, ServiceTypesPerformanceDistributionResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface ServiceTypesPerformanceChartProps {
  data?: {
    signed: ServiceTypesPerformanceDistributionResponse;
    completed: ServiceTypesPerformanceDistributionResponse;
  };
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

// Colors for the pie chart segments
const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
  "#6b7280", // gray
];

export const ServiceTypesPerformanceChart: React.FC<ServiceTypesPerformanceChartProps> = ({
  data,
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<"SIGNED" | "COMPLETED">("SIGNED");

  // Get current data based on active status
  const currentData = useMemo(() => {
    if (!data) return null;
    return activeStatus === "SIGNED" ? data.signed : data.completed;
  }, [data, activeStatus]);

  // Transform data for recharts and calculate total
  const chartData = useMemo(() => {
    if (!currentData?.data) return [];
    return currentData.data.map((item, index) => ({
      name: item.service_type_name,
      value: item.count,
      service_type_id: item.service_type_id,
      color: COLORS[index % COLORS.length],
    }));
  }, [currentData]);

  // Calculate total count
  const totalCount = useMemo(() => {
    return currentData?.total_count || 0;
  }, [currentData]);

  // Handle clicking on a pie segment
  const handleSegmentClick = (segmentData: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // Add the clicked service type and current status to the filters
    const statusDisplayName = activeStatus === "SIGNED" ? "Signed" : "Completed";

    const updatedFilters = {
      ...unifiedFilters,
      service_type: [segmentData.service_type_id],
      status: [statusDisplayName],
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

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Service Type: ${data.name}`}</p>
          <p className="text-gray-600">{`Purposes: ${data.value}`}</p>
          <p className="text-gray-500 text-sm">{`Status: ${activeStatus === "SIGNED" ? "Signed" : "Completed"}`}</p>
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Service Types by Performance Status</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || (!data.signed?.data?.length && !data.completed?.data?.length)) {
    return (
      <div className="w-full h-96 flex flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Service Types by Performance Status</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No performance data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title and Status Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Service Types by Performance Status</h3>
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === "SIGNED"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setActiveStatus("SIGNED")}
          >
            Signed
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === "COMPLETED"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setActiveStatus("COMPLETED")}
          >
            Completed
          </button>
        </div>
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
                <div className="text-sm text-gray-600">{activeStatus === "SIGNED" ? "Signed" : "Completed"}</div>
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
