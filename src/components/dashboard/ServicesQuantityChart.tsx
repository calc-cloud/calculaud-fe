
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServicesQuantityResponse } from '@/types/analytics';

interface ServicesQuantityChartProps {
  data: ServicesQuantityResponse | undefined;
  isLoading: boolean;
}

export const ServicesQuantityChart: React.FC<ServicesQuantityChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quantities by Service</CardTitle>
          <CardDescription>Total quantities for each service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quantities by Service</CardTitle>
          <CardDescription>Total quantities for each service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = data.labels.map((label, index) => ({
    service: label,
    quantity: data.data[index]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantities by Service</CardTitle>
        <CardDescription>Total quantities for each service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="service" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={[(value: number) => [value, 'Quantity']]}
                labelFormatter={(label: string) => `Service: ${label}`}
              />
              <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
