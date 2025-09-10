import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardFilters, BudgetSourceDistributionResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface BudgetSourceDistributionChartProps {
  data: BudgetSourceDistributionResponse | undefined;
  isLoading: boolean;
  globalFilters: DashboardFilters;
}

// Colors for the pie chart segments
const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
  "#6b7280", // gray
];

export const BudgetSourceDistributionChart: React.FC<BudgetSourceDistributionChartProps> = ({
  data,
  isLoading,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for recharts and calculate total USD
  const { chartData, totalUSD } = useMemo(() => {
    if (!data || !data.data) return { chartData: [], totalUSD: 0 };

    let totalUSD = 0;
    const chartData = data.data.map((item, index) => {
      totalUSD += item.amounts.total_usd;
      return {
        name: item.budget_source_name,
        value: item.amounts.total_usd,
        budget_source_id: item.budget_source_id,
        amounts: item.amounts,
        color: COLORS[index % COLORS.length],
      };
    });

    return { chartData, totalUSD };
  }, [data]);

  // Handle clicking on a pie segment
  const handleSegmentClick = (segmentData: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // Add the clicked budget source to the filters
    const updatedFilters = {
      ...unifiedFilters,
      budget_source: segmentData.budget_source_id ? [segmentData.budget_source_id] : [],
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
    if (updatedFilters.budget_source && updatedFilters.budget_source.length > 0) {
      searchParams.set("budget_source_id", updatedFilters.budget_source.join(","));
    }

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const amounts = data.payload.amounts;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Budget Source: ${data.name}`}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">{`ILS: ${amounts.ils.toLocaleString()}`}</p>
            <p className="text-gray-600">{`Support USD: $${amounts.support_usd.toLocaleString()}`}</p>
            <p className="text-gray-600">{`Available USD: $${amounts.available_usd.toLocaleString()}`}</p>
            <p className="text-gray-600 font-medium">{`Total USD: $${amounts.total_usd.toLocaleString()}`}</p>
            <p className="text-gray-600">{`Total ILS: ${amounts.total_ils.toLocaleString()}`}</p>
          </div>
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
          const percentage = totalUSD > 0 ? ((entry.value / totalUSD) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-medium truncate" title={entry.name}>
                  {entry.name}
                </span>
              </div>
              <div className="text-xs text-gray-600 ml-5">
                ${entry.value.toLocaleString()} ({percentage}%)
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
          <h3 className="text-lg font-semibold text-gray-900">Budget Source Distribution</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">Budget Source Distribution</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No budget source data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Source Distribution</h3>
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
                <div className="text-2xl font-bold text-gray-900">${Math.round(totalUSD).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total In USD</div>
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
