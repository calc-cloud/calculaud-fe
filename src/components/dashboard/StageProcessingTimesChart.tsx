import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { DashboardFilters, StageProcessingTimesResponse } from "@/types/analytics";
import { UnifiedFilters } from "@/types/filters";
import { getServiceTypeColor } from "@/utils/chartColors";
import { dashboardFiltersToUnified } from "@/utils/filterAdapters";

interface StageProcessingTimesChartProps {
  data?: StageProcessingTimesResponse;
  isLoading?: boolean;
  globalFilters: DashboardFilters;
}

interface ChartDataPoint {
  x: number; // Processing days
  y: number; // Stage index for positioning
  stageName: string;
  stageDisplayName: string;
  type: "stage_overall" | "service_type";
  service_type_id?: number;
  service_type_name?: string;
  count: number;
  min_processing_days: number;
  max_processing_days: number;
  color: string;
  size: number;
}

// Create tooltip-enabled dot components that use external tooltip state
const createStarDot = (setActiveTooltip: (tooltip: any) => void) => {
  const StarDotComponent = (props: any) => {
  const { cx, cy, fill, stroke, payload } = props;
  const size = 12; // Star size
  const color = fill || stroke || "#f59e0b";

  // Star path - 5-pointed star
  const starPath = `M${cx},${cy - size} L${cx + size * 0.3},${cy - size * 0.3} L${cx + size},${cy - size * 0.3} L${cx + size * 0.5},${cy + size * 0.2} L${cx + size * 0.8},${cy + size} L${cx},${cy + size * 0.6} L${cx - size * 0.8},${cy + size} L${cx - size * 0.5},${cy + size * 0.2} L${cx - size},${cy - size * 0.3} L${cx - size * 0.3},${cy - size * 0.3} Z`;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const chartContainer = (e.target as SVGElement).closest('.recharts-wrapper');
    const containerRect = chartContainer?.getBoundingClientRect();

    if (containerRect) {
      setActiveTooltip({
        data: {
          type: 'stage_overall',
          y: payload.y,
          min_processing_days: payload.min_processing_days,
          max_processing_days: payload.max_processing_days,
          count: payload.count
        },
        position: {
          x: rect.left - containerRect.left + 15,
          y: rect.top - containerRect.top - 10
        }
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <path
      d={starPath}
      fill={color}
      stroke={color}
      strokeWidth={1}
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
  };

  StarDotComponent.displayName = 'StarDotComponent';
  return StarDotComponent;
};

const createCircleDot = (setActiveTooltip: (tooltip: any) => void) => {
  const CircleDotComponent = (props: any) => {
  const { cx, cy, fill, payload } = props;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const chartContainer = (e.target as SVGElement).closest('.recharts-wrapper');
    const containerRect = chartContainer?.getBoundingClientRect();

    if (containerRect) {
      setActiveTooltip({
        data: {
          type: 'service_type',
          service_type_name: payload.service_type_name,
          y: payload.y,
          min_processing_days: payload.min_processing_days,
          max_processing_days: payload.max_processing_days,
          count: payload.count
        },
        position: {
          x: rect.left - containerRect.left + 10,
          y: rect.top - containerRect.top - 10
        }
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={fill}
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
  };

  CircleDotComponent.displayName = 'CircleDotComponent';
  return CircleDotComponent;
};


export const StageProcessingTimesChart: React.FC<StageProcessingTimesChartProps> = ({
  data,
  isLoading = false,
  globalFilters,
}) => {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState<{ data: any; position: { x: number; y: number } } | null>(null);

  // Create dot components with shared tooltip state
  const StarDot = useMemo(() => createStarDot(setActiveTooltip), []);
  const CircleDot = useMemo(() => createCircleDot(setActiveTooltip), []);

  // Transform data for composed chart
  const { lineChartData, chartData, uniqueServiceTypes } = useMemo(() => {
    if (!data?.data) return { lineChartData: [], chartData: [], uniqueServiceTypes: [] };

    const allDataPoints: ChartDataPoint[] = [];
    const lineData: any[] = [];
    const serviceTypeSet = new Set<string>();

    data.data.forEach((stage, stageIndex) => {
      // Create line chart data for stage overall (for Line component)
      lineData.push({
        x: stageIndex,
        y: stage.overall_avg_processing_days,
        stageIndex,
        stageName: stage.stage_type_name,
        stageDisplayName: stage.stage_type_display_name,
        type: "stage_overall",
        count: stage.overall_count,
        min_processing_days: stage.overall_min_processing_days,
        max_processing_days: stage.overall_max_processing_days,
      });

      // Add stage overall average point (for custom star dots)
      allDataPoints.push({
        x: stageIndex,
        y: stage.overall_avg_processing_days,
        stageName: stage.stage_type_name,
        stageDisplayName: stage.stage_type_display_name,
        type: "stage_overall",
        count: stage.overall_count,
        min_processing_days: stage.overall_min_processing_days,
        max_processing_days: stage.overall_max_processing_days,
        color: "#f59e0b", // Gold for prominence
        size: 120, // Larger size
      });

      // Add service type points (smaller, colored by service type)
      stage.service_types.forEach((serviceType) => {
        serviceTypeSet.add(serviceType.service_type_name);
        allDataPoints.push({
          x: stageIndex,
          y: serviceType.avg_processing_days,
          stageName: stage.stage_type_name,
          stageDisplayName: stage.stage_type_display_name,
          type: "service_type",
          service_type_id: serviceType.service_type_id,
          service_type_name: serviceType.service_type_name,
          count: serviceType.count,
          min_processing_days: serviceType.min_processing_days,
          max_processing_days: serviceType.max_processing_days,
          color: getServiceTypeColor(serviceType.service_type_id, serviceType.service_type_name),
          size: 60, // Smaller size
        });
      });
    });

    const uniqueServiceTypes = Array.from(serviceTypeSet).map((name) => {
      // Find a data point with this service type to get the color
      const point = allDataPoints.find((p) => p.service_type_name === name);
      return {
        name,
        color: point?.color || "#6b7280",
      };
    });

    return { lineChartData: lineData, chartData: allDataPoints, uniqueServiceTypes };
  }, [data]);

  // Get stage names for X-axis and max value for Y-axis
  const { stageNames, maxProcessingDays } = useMemo(() => {
    if (!data?.data) return { stageNames: [], maxProcessingDays: 0 };

    const names = data.data.map((stage) => stage.stage_type_display_name);
    const maxDays = Math.max(...chartData.map(point => point.y));

    return { stageNames: names, maxProcessingDays: maxDays };
  }, [data, chartData]);

  // Handle clicking on a scatter point
  const handlePointClick = (pointData: ChartDataPoint) => {
    const unifiedFilters: UnifiedFilters = dashboardFiltersToUnified(globalFilters);
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

    // Add service type filter if clicking on service type point
    if (pointData.type === "service_type" && pointData.service_type_id) {
      searchParams.set("service_type_id", pointData.service_type_id.toString());
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  // Custom legend
  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
        {/* Stage Overall Legend */}
        <div className="flex items-center space-x-2">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M10,2 L11.5,7 L16.5,7 L13,10.5 L14.5,16 L10,12.5 L5.5,16 L7,10.5 L3.5,7 L8.5,7 Z"
              fill="#f59e0b"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">Stage Overall Average</span>
        </div>

        {/* Service Type Legends */}
        {uniqueServiceTypes.map((serviceType) => (
          <div key={serviceType.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: serviceType.color }}
            />
            <span className="text-sm text-gray-600">{serviceType.name}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col p-4 min-h-[600px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stage Processing Times</h3>
          <p className="text-sm text-gray-600">Average processing days by stage and service type</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="w-full flex flex-col p-4 min-h-[600px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stage Processing Times</h3>
          <p className="text-sm text-gray-600">Average processing days by stage and service type</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No stage processing times data available
        </div>
      </div>
    );
  }

  // Separate data for different series
  const stageOverallData = chartData.filter((point) => point.type === "stage_overall");
  const serviceTypeData = chartData.filter((point) => point.type === "service_type");

  return (
    <div className="w-full flex flex-col p-4">
      {/* Chart Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stage Processing Times</h3>
        <p className="text-sm text-gray-600">Average processing days by stage and service type</p>
      </div>

      {/* Chart Content */}
      <div className="flex-1 relative">
        <div className="relative">
          <ResponsiveContainer width="100%" height={600}>
            <ComposedChart
              data={lineChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, stageNames.length - 0.5]}
              tickFormatter={(value) => stageNames[Math.round(value)] || ""}
              ticks={stageNames.map((_, index) => index)}
              fontSize={14}
            />
            <YAxis
              type="number"
              dataKey="y"
              label={{ value: "Processing Days", angle: -90, position: "insideLeft" }}
              fontSize={14}
              domain={[0, "dataMax"]}
              tickCount={15}
              tickFormatter={(value) => {
                const roundedValue = Math.round(value);
                // Show multiples of 10 or the maximum value
                return (roundedValue % 10 === 0 || roundedValue >= maxProcessingDays) ? roundedValue.toString() : "";
              }}
            />
            <Tooltip content={() => null} />

            {/* Stage overall averages - connecting line only (no interaction) */}
            <Line
              dataKey="y"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={false}
            />

            {/* Stage overall averages - interactive star dots */}
            <Scatter
              data={stageOverallData}
              fill="#f59e0b"
              onClick={(data) => data && handlePointClick(data)}
              className="cursor-pointer"
              shape={<StarDot />}
            />

            {/* Service type dots - colored by service type */}
            {uniqueServiceTypes.map((serviceType) => {
              const serviceTypePoints = serviceTypeData.filter(
                (point) => point.service_type_name === serviceType.name
              );
              return (
                <Scatter
                  key={serviceType.name}
                  data={serviceTypePoints}
                  fill={serviceType.color}
                  onClick={(data) => data && handlePointClick(data)}
                  className="cursor-pointer"
                  shape={<CircleDot />}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>

        {/* External tooltip that appears on top */}
        {activeTooltip && (
          <div
            className="absolute bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm pointer-events-none z-50"
            style={{
              left: activeTooltip.position.x,
              top: activeTooltip.position.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {activeTooltip.data.type === "stage_overall" ? (
              <>
                <p className="text-gray-600">Overall Average: {activeTooltip.data.y.toFixed(1)} days</p>
                <p className="text-gray-600">Min: {activeTooltip.data.min_processing_days} days</p>
                <p className="text-gray-600">Max: {activeTooltip.data.max_processing_days} days</p>
                <p className="text-gray-500 text-sm">Total Purposes: {activeTooltip.data.count}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-700 mb-1">{activeTooltip.data.service_type_name}</p>
                <p className="text-gray-600">Average: {activeTooltip.data.y.toFixed(1)} days</p>
                <p className="text-gray-600">Min: {activeTooltip.data.min_processing_days} days</p>
                <p className="text-gray-600">Max: {activeTooltip.data.max_processing_days} days</p>
                <p className="text-gray-500 text-sm">Purposes: {activeTooltip.data.count}</p>
              </>
            )}
          </div>
        )}
      </div>

        {/* Custom Legend */}
        {renderCustomLegend()}
      </div>
    </div>
  );
};