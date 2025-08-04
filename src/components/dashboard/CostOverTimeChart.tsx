import { ExternalLink } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenditureTimelineResponse, DashboardFilters } from "@/types/analytics";

interface CostOverTimeChartProps {
  data: ExpenditureTimelineResponse | undefined;
  isLoading: boolean;
  globalFilters: DashboardFilters;
  onGroupByChange: (groupBy: "day" | "week" | "month" | "year") => void;
}

// Colors for the stacked bars (similar to the reference image)
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

const GROUP_BY_OPTIONS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

export const CostOverTimeChart: React.FC<CostOverTimeChartProps> = ({ data, isLoading, onGroupByChange }) => {
  const [currency, setCurrency] = useState<"ILS" | "USD">("ILS");
  const navigate = useNavigate();

  const handleViewInSearch = () => {
    const currentParams = new URLSearchParams(window.location.search);
    navigate(`/search?${currentParams.toString()}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost Over Time</CardTitle>
              <CardDescription>Expenditure analysis over time with service type breakdown</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInSearch}
              className="h-8 w-8 p-0"
              title="View in Search"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Group By</label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Loading..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading">Loading...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Loading..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading">Loading...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost Over Time</CardTitle>
              <CardDescription>Expenditure analysis over time with service type breakdown</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInSearch}
              className="h-8 w-8 p-0"
              title="View in Search"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Group By</label>
                <Select
                  value={data?.group_by || "month"}
                  onValueChange={(value) => onGroupByChange(value as "day" | "week" | "month" | "year")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_BY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as "ILS" | "USD")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ILS">ILS (₪)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts stacked bar chart
  const chartData = data.items.map((item) => {
    const transformedItem: any = {
      time_period: item.time_period,
      total: currency === "ILS" ? item.total_ils : item.total_usd,
    };

    // Add each service type as a separate property for stacking
    item.data.forEach((serviceType) => {
      const value = currency === "ILS" ? serviceType.total_ils : serviceType.total_usd;
      transformedItem[serviceType.name] = value;
    });

    return transformedItem;
  });

  // Get all unique service type names for the bars
  const serviceTypeNames = Array.from(new Set(data.items.flatMap((item) => item.data.map((st) => st.name))));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

      // Sort payload to match the order of service types in the stacked bar (bottom to top)
      const sortedPayload = payload.sort((a: any, b: any) => {
        const indexA = serviceTypeNames.indexOf(a.dataKey);
        const indexB = serviceTypeNames.indexOf(b.dataKey);
        return indexB - indexA; // Reverse order to match bottom-to-top stacking
      });

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Period: ${label}`}</p>
          <p className="font-medium text-gray-700 mb-2">
            {`Total: ${currency === "ILS" ? "₪" : "$"}${total.toLocaleString()}`}
          </p>
          {sortedPayload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${currency === "ILS" ? "₪" : "$"}${entry.value?.toLocaleString() || 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cost Over Time</CardTitle>
            <CardDescription>Expenditure analysis over time with service type breakdown</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleViewInSearch} className="h-8 w-8 p-0" title="View in Search">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Group By</label>
              <Select
                value={data.group_by}
                onValueChange={(value) => onGroupByChange(value as "day" | "week" | "month" | "year")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time grouping" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_BY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <Select value={currency} onValueChange={(value) => setCurrency(value as "ILS" | "USD")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">ILS (₪)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time_period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${currency === "ILS" ? "₪" : "$"}${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {serviceTypeNames.map((serviceTypeName, index) => (
                <Bar
                  key={serviceTypeName}
                  dataKey={serviceTypeName}
                  stackId="cost"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
