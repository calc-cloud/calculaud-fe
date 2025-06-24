
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServicesQuantityResponse } from '@/types/analytics';

interface ServicesQuantityChartProps {
  data: ServicesQuantityResponse | undefined;
  isLoading: boolean;
}

// Colors for different service types
const SERVICE_TYPE_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

export const ServicesQuantityChart: React.FC<ServicesQuantityChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quantities by Service</CardTitle>
          <CardDescription>Total quantities for each service grouped by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quantities by Service</CardTitle>
          <CardDescription>Total quantities for each service grouped by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group services by service type and sort them
  const groupedData = data.data.reduce((acc, item) => {
    const serviceType = item.service_type_name;
    if (!acc[serviceType]) {
      acc[serviceType] = [];
    }
    acc[serviceType].push(item);
    return acc;
  }, {} as Record<string, typeof data.data>);

  // Create chart data with grouped services
  const chartData: any[] = [];
  const serviceTypeColorMap: Record<string, string> = {};
  let colorIndex = 0;

  // Assign colors to service types and create chart data
  Object.keys(groupedData).forEach((serviceTypeName) => {
    serviceTypeColorMap[serviceTypeName] = SERVICE_TYPE_COLORS[colorIndex % SERVICE_TYPE_COLORS.length];
    colorIndex++;

    groupedData[serviceTypeName].forEach((service) => {
      chartData.push({
        service: service.name,
        quantity: service.quantity,
        serviceType: service.service_type_name,
        color: serviceTypeColorMap[serviceTypeName]
      });
    });
  });

  // Sort chart data by service type first, then by service name
  chartData.sort((a, b) => {
    if (a.serviceType !== b.serviceType) {
      return a.serviceType.localeCompare(b.serviceType);
    }
    return a.service.localeCompare(b.service);
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Service: ${data.service}`}</p>
          <p className="text-gray-600">{`Service Type: ${data.serviceType}`}</p>
          <p className="text-gray-600">{`Quantity: ${data.quantity}`}</p>
        </div>
      );
    }
    return null;
  };

  // Create legend data
  const legendData = Object.keys(serviceTypeColorMap).map(serviceType => ({
    value: serviceType,
    type: 'rect' as const,
    color: serviceTypeColorMap[serviceType]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantities by Service</CardTitle>
        <CardDescription>Total quantities for each service grouped by service type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="service" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                payload={legendData}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="quantity" 
                radius={[4, 4, 0, 0]}
                fill={(entry: any) => entry.color}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
