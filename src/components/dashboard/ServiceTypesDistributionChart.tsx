import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardFilters, ServiceTypesDistributionResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getServiceTypeColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface ServiceTypesDistributionChartProps {
  data: ServiceTypesDistributionResponse | undefined;
  isLoading: boolean;
  globalFilters: DashboardFilters;
}

export const ServiceTypesDistributionChart: React.FC<ServiceTypesDistributionChartProps> = ({
  data,
  isLoading,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for recharts
  const chartData = useMemo(() => {
    if (!data || !data.data) return [];
    return data.data.map((item) => ({
      name: item.name,
      value: item.count,
      id: item.id,
      color: getServiceTypeColor(item.id, item.name),
    }));
  }, [data]);

  // Calculate total count
  const totalCount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Handle clicking on a pie segment
  const handleSegmentClick = (segmentData: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // For Live Operations, exclude COMPLETED status from search results
    const nonCompletedStatuses = ["In Progress", "Signed", "Partially Supplied"];

    // Add the clicked service type to the filters and exclude COMPLETED status
    const updatedFilters = {
      ...unifiedFilters,
      service_type: [segmentData.id], // Use service type ID for search page compatibility
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

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalCount > 0 ? ((data.value / totalCount) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Service Type: ${data.name} (${percentage}%)`}</p>
          <p className="text-gray-600">{`Purposes: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend for right-side layout
  const renderCustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-col space-y-3">
        {payload.map((entry: any, index: number) => {
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium truncate" title={entry.name}>
                {entry.name}
              </span>
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
          <h3 className="text-lg font-semibold text-gray-900">Service Types Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Service Types Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No service type data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Service Types Distribution</h3>
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
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handleSegmentClick}
                  className="cursor-pointer"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend Container */}
        <div className="w-48 pl-6">{renderCustomLegend({ payload: chartData })}</div>
      </div>
    </div>
  );
};
