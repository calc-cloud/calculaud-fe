import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { DashboardFilters, ProcessingTimesResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getServiceTypeColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface PurposeProcessingTimesChartProps {
  data?: ProcessingTimesResponse;
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

export const PurposeProcessingTimesChart: React.FC<PurposeProcessingTimesChartProps> = ({
  data,
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for recharts
  const chartData = useMemo(() => {
    if (!data?.service_types) return [];

    return data.service_types.map((serviceType) => ({
      name: serviceType.service_type_name,
      average_processing_days: serviceType.average_processing_days,
      min_processing_days: serviceType.min_processing_days,
      max_processing_days: serviceType.max_processing_days,
      count: serviceType.count,
      service_type_id: serviceType.service_type_id,
      color: getServiceTypeColor(serviceType.service_type_id, serviceType.service_type_name),
    }));
  }, [data]);

  // Handle clicking on a bar
  const handleBarClick = (clickedData: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // Build search URL with filters
    const searchParams = new URLSearchParams();

    if (unifiedFilters.relative_time) {
      searchParams.set("relative_time", unifiedFilters.relative_time);
    }
    if (unifiedFilters.start_date) {
      searchParams.set("start_date", unifiedFilters.start_date);
    }
    if (unifiedFilters.end_date) {
      searchParams.set("end_date", unifiedFilters.end_date);
    }

    // Filter by the specific clicked service type
    if (clickedData.service_type_id) {
      searchParams.set("service_type_id", clickedData.service_type_id.toString());
    }

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.name}</p>
          <p className="text-gray-600">Average: {data.average_processing_days.toFixed(1)} days</p>
          <p className="text-gray-600">Min: {data.min_processing_days} days</p>
          <p className="text-gray-600">Max: {data.max_processing_days} days</p>
          <p className="text-gray-500 text-sm">Purposes: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col p-4 min-h-96">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Purpose Processing Times</h3>
          <p className="text-sm text-gray-600">Average processing days by service type</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || !data.service_types || data.service_types.length === 0) {
    return (
      <div className="w-full flex flex-col p-4 min-h-96">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Purpose Processing Times</h3>
          <p className="text-sm text-gray-600">Average processing days by service type</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No processing times data available</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Purpose Processing Times</h3>
        <p className="text-sm text-gray-600">Average processing days by service type</p>
      </div>

      {/* Chart Content */}
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 180, bottom: 20 }}
            className="cursor-pointer"
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                const clickedBarData = data.activePayload[0].payload;
                handleBarClick(clickedBarData);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={12} label={{ value: "Days", position: "bottom" }} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={160} fontSize={14} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="average_processing_days">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
