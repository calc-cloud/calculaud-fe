import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardFilters, ServiceTypeCostsDistributionResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getServiceTypeColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface ServiceTypeCostsDistributionChartProps {
  data: ServiceTypeCostsDistributionResponse | undefined;
  isLoading: boolean;
  globalFilters: DashboardFilters;
}

export const ServiceTypeCostsDistributionChart: React.FC<ServiceTypeCostsDistributionChartProps> = ({
  data,
  isLoading,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // Transform data for recharts and calculate total USD
  const { chartData, totalUSD } = useMemo(() => {
    if (!data || !data.data) return { chartData: [], totalUSD: 0 };

    let totalUSD = 0;
    const chartData = data.data.map((item) => {
      totalUSD += item.amounts.total_usd;
      return {
        name: item.service_type_name,
        value: item.amounts.total_usd,
        service_type_id: item.service_type_id,
        amounts: item.amounts,
        color: getServiceTypeColor(item.service_type_id, item.service_type_name),
      };
    });

    return { chartData, totalUSD };
  }, [data]);

  // Handle clicking on a pie segment
  const handleSegmentClick = (segmentData: any) => {
    // Convert global filters to unified format
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);

    // Add the clicked service type to the filters
    const updatedFilters = {
      ...unifiedFilters,
      service_type: [segmentData.service_type_id],
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

    // Navigate to search page with filters
    navigate(`/search?${searchParams.toString()}`);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const amounts = data.payload.amounts;
      const percentage = totalUSD > 0 ? ((amounts.total_usd / totalUSD) * 100).toFixed(1) : 0;

      return (
        <div
          className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
          style={{ transform: 'translate(10px, -100%)' }}
        >
          <p className="font-medium text-gray-900 mb-2 text-sm">{`Service Type: ${data.name} (${percentage}%)`}</p>
          <div className="space-y-0.5 text-xs">
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
          <h3 className="text-lg font-semibold text-gray-900">Costs Distribution By Service Type</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">Costs Distribution By Service Type</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No service type costs data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Costs Distribution By Service Type</h3>
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
                <Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 9999, pointerEvents: 'none', outline: 'none' }}
                  cursor={false}
                  isAnimationActive={false}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">${Math.round(totalUSD).toLocaleString()}</div>
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
