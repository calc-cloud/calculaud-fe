
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

  // Group services by service type and create chart data
  const serviceTypeGroups = data.data.reduce((acc, item) => {
    const serviceTypeName = item.service_type_name;
    if (!acc[serviceTypeName]) {
      acc[serviceTypeName] = [];
    }
    acc[serviceTypeName].push(item);
    return acc;
  }, {} as Record<string, typeof data.data>);

  // Create chart data with service types as categories and services as bars
  const chartData = Object.entries(serviceTypeGroups).map(([serviceTypeName, services]) => {
    const dataPoint: any = {
      serviceType: serviceTypeName,
    };
    
    // Add each service as a separate data key
    services.forEach((service) => {
      dataPoint[service.name] = service.quantity;
    });
    
    return dataPoint;
  });

  // Get all unique service names for creating bars
  const allServiceNames = [...new Set(data.data.map(item => item.name))];

  // Create color mapping for services
  const serviceColorMap = allServiceNames.reduce((acc, serviceName, index) => {
    acc[serviceName] = SERVICE_TYPE_COLORS[index % SERVICE_TYPE_COLORS.length];
    return acc;
  }, {} as Record<string, string>);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{`Service Type: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-600" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
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
        <CardTitle>Quantities by Service</CardTitle>
        <CardDescription>Total quantities for each service grouped by service type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="serviceType" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Create a bar for each unique service name */}
              {allServiceNames.map((serviceName) => (
                <Bar
                  key={serviceName}
                  dataKey={serviceName}
                  fill={serviceColorMap[serviceName]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
