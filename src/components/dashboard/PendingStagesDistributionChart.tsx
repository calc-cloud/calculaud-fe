import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { DashboardFilters, PendingStagesDistributionItem } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface PendingStagesDistributionChartProps {
  data?: PendingStagesDistributionItem[];
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

// Colors for different service types (consistent with other charts)
const SERVICE_TYPE_COLORS = [
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

export const PendingStagesDistributionChart: React.FC<PendingStagesDistributionChartProps> = ({
  data = [],
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for stacked bar chart
  const { chartData, serviceTypes, serviceTypeColors } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], serviceTypes: [], serviceTypeColors: {} };
    }

    // Get all unique service types across all stages
    const allServiceTypes = new Set<string>();
    data.forEach((stage) => {
      stage.service_types.forEach((serviceType) => {
        allServiceTypes.add(serviceType.service_type_name);
      });
    });

    const serviceTypesArray = Array.from(allServiceTypes).sort();

    // Assign colors to service types
    const colors: Record<string, string> = {};
    serviceTypesArray.forEach((serviceType, index) => {
      colors[serviceType] = SERVICE_TYPE_COLORS[index % SERVICE_TYPE_COLORS.length];
    });

    // Transform data for Recharts stacked bar format
    const transformedData = data.map((stage) => {
      const stageData: any = {
        stage_name: stage.stage_type_name,
        stage_id: stage.stage_type_id,
        total_count: stage.total_count,
      };

      // Initialize all service types with 0
      serviceTypesArray.forEach((serviceType) => {
        stageData[serviceType] = 0;
      });

      // Fill in actual values
      stage.service_types.forEach((serviceType) => {
        stageData[serviceType.service_type_name] = serviceType.count;
      });

      return stageData;
    });

    return {
      chartData: transformedData,
      serviceTypes: serviceTypesArray,
      serviceTypeColors: colors,
    };
  }, [data]);

  // Handle clicking on a bar segment
  const handleBarClick = () => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // For Live Operations, exclude COMPLETED status from search results
    const nonCompletedStatuses = ["In Progress", "Signed", "Partially Supplied"];

    const updatedFilters = {
      ...unifiedFilters,
      status: nonCompletedStatuses, // Always exclude COMPLETED status for live operations
      // Note: We don't have a stage type filter in the search, so we'll just use status filtering
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Stage: ${label}`}</p>
          <p className="text-gray-600 mb-2">{`Total: ${total}`}</p>
          {payload
            .filter((entry: any) => entry.value > 0)
            .reverse()
            .map((entry: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-sm">
                  {entry.dataKey}: {entry.value}
                </span>
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pending Stages Distribution</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">Pending Stages Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No pending stages data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pending Stages Distribution</h3>
      </div>

      {/* Chart Content */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            onClick={handleBarClick}
            className="cursor-pointer"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stage_name" height={40} fontSize={14} />
            <YAxis fontSize={14} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {serviceTypes.map((serviceType) => (
              <Bar key={serviceType} dataKey={serviceType} stackId="stages" fill={serviceTypeColors[serviceType]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
