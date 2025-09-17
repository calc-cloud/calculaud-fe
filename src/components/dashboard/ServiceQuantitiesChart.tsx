import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

import { DashboardFilters, ServiceQuantitiesResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getServiceTypeColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface MaterialQuantitiesChartProps {
  data?: ServiceQuantitiesResponse;
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

export const MaterialQuantitiesChart: React.FC<MaterialQuantitiesChartProps> = ({
  data,
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();

  // State for show more/less functionality
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_ITEMS_COUNT = 10;

  // Transform data to show individual materials across all service types
  const { chartData, legendData, totalCount } = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) {
      return { chartData: [], legendData: [], totalCount: 0 };
    }

    const materialsData: any[] = [];

    data.data.forEach((serviceType) => {
      serviceType.services.forEach((material: any) => {
        materialsData.push({
          name: material.service_name,
          quantity: material.quantity,
          serviceId: material.service_id, // Add service ID for individual material filtering
          color: getServiceTypeColor(serviceType.service_type_id, serviceType.service_type_name),
          serviceTypeData: serviceType, // For grouping/context
        });
      });
    });

    // Create legend data for service types that have materials
    const legendData = data.data
      .filter((serviceType) => serviceType.services.length > 0)
      .map((serviceType) => ({
        value: serviceType.service_type_name,
        type: "rect" as const,
        color: getServiceTypeColor(serviceType.service_type_id, serviceType.service_type_name),
      }));

    // Slice data based on expanded state
    const displayedData = isExpanded ? materialsData : materialsData.slice(0, INITIAL_ITEMS_COUNT);

    return {
      chartData: displayedData,
      legendData,
      totalCount: materialsData.length,
    };
  }, [data, isExpanded]);

  // Handle clicking on a bar segment
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

    // Filter by the specific clicked material
    if (clickedData.serviceId) {
      searchParams.set("material_id", clickedData.serviceId.toString());
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
          <p className="text-gray-600">Quantity: {data.quantity}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col p-4 min-h-96">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Material Quantities</h3>
          <p className="text-sm text-gray-600">Breakdown of material quantities across different materials</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="w-full flex flex-col p-4 min-h-96">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Material Quantities</h3>
          <p className="text-sm text-gray-600">Breakdown of material quantities across different materials</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">No materials data available</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Material Quantities
          {totalCount > INITIAL_ITEMS_COUNT && !isExpanded && (
            <span className="text-base font-normal text-gray-600 ml-2">
              (showing {Math.min(INITIAL_ITEMS_COUNT, totalCount)} of {totalCount})
            </span>
          )}
        </h3>
      </div>

      {/* Chart Content */}
      <div className="flex-1 relative">
        {/* Fade effect overlay when content is truncated - positioned over the last few bars */}
        {totalCount > INITIAL_ITEMS_COUNT && !isExpanded && (
          <div className="absolute bottom-11 left-48 right-2 h-60 bg-gradient-to-t from-white via-white/80 via-white/50 via-white/20 to-transparent pointer-events-none z-10" />
        )}
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 40)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
            className="cursor-pointer"
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                // Always navigate to search when clicking a bar with the clicked item data
                const clickedBarData = data.activePayload[0].payload;
                handleBarClick(clickedBarData);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" fontSize={14} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={180} fontSize={14} />
            <Tooltip content={<CustomTooltip />} />
            {legendData.length > 0 && <Legend payload={legendData} />}
            <Bar dataKey="quantity" label={{ position: "right", fontSize: 14, fill: "#374151" }}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Show More/Less Button */}
      {totalCount > INITIAL_ITEMS_COUNT && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:text-blue-800 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200 shadow-sm hover:shadow"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show {totalCount - INITIAL_ITEMS_COUNT} more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
