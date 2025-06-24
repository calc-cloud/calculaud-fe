import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { HierarchyDistributionResponse, DashboardFilters } from '@/types/analytics';
import { HierarchySelector } from '@/components/common/HierarchySelector';
import { useAdminData } from '@/contexts/AdminDataContext';

interface HierarchyDistributionChartProps {
  data: HierarchyDistributionResponse | undefined;
  isLoading: boolean;
  globalFilters: DashboardFilters;
  onFiltersChange: (level?: 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | null, parent_id?: number | null) => void;
}

// Colors for the pie chart segments
const COLORS = [
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

const HIERARCHY_LEVELS = ['UNIT', 'CENTER', 'ANAF', 'MADOR', 'TEAM'] as const;

export const HierarchyDistributionChart: React.FC<HierarchyDistributionChartProps> = ({ 
  data, 
  isLoading,
  globalFilters,
  onFiltersChange
}) => {
  const { hierarchies } = useAdminData();
  const [selectedHierarchy, setSelectedHierarchy] = useState<number | undefined>();
  const [selectedLevel, setSelectedLevel] = useState<'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | 'DIRECT_CHILDREN'>('DIRECT_CHILDREN');

  // Get available drill-down levels based on selected hierarchy
  const getAvailableLevels = () => {
    const levels = ['DIRECT_CHILDREN'];
    
    if (!selectedHierarchy) {
      // When no hierarchy is selected, show ANAF, MADOR, TEAM (skipping CENTER as it's one level down)
      levels.push('ANAF', 'MADOR', 'TEAM');
    } else {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy);
      if (hierarchy) {
        const currentLevelIndex = HIERARCHY_LEVELS.indexOf(hierarchy.type as any);
        // Return two levels down from current level
        const availableHierarchyLevels = HIERARCHY_LEVELS.slice(currentLevelIndex + 2, currentLevelIndex + 4);
        levels.push(...availableHierarchyLevels);
      }
    }
    
    return levels;
  };

  const availableLevels = getAvailableLevels();

  // Update filters when hierarchy or level changes
  useEffect(() => {
    // Send null as parent_id when no hierarchy is selected
    const parentId = selectedHierarchy || null;
    // Send null as level when "Direct Children" is selected
    const level = selectedLevel === 'DIRECT_CHILDREN' ? null : selectedLevel as 'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM';
    onFiltersChange(level, parentId);
  }, [selectedLevel, selectedHierarchy, onFiltersChange]);

  // Reset level when hierarchy changes
  useEffect(() => {
    const levels = getAvailableLevels();
    if (levels.length > 0 && !levels.includes(selectedLevel)) {
      setSelectedLevel('DIRECT_CHILDREN');
    }
  }, [selectedHierarchy]);

  // Handle hierarchy selection change
  const handleHierarchySelectionChange = (selectedIds: number[]) => {
    if (selectedIds.length === 0) {
      // No selection - clear current selection
      setSelectedHierarchy(undefined);
    } else {
      // New selection - always take the latest selected item
      const newSelectedId = selectedIds[selectedIds.length - 1];
      
      // If it's the same as current selection, deselect it
      if (newSelectedId === selectedHierarchy) {
        setSelectedHierarchy(undefined);
      } else {
        // Otherwise, select the new hierarchy
        setSelectedHierarchy(newSelectedId);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purposes by Hierarchies</CardTitle>
          <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Hierarchy</label>
                <div className="w-full opacity-50 pointer-events-none">
                  <HierarchySelector
                    hierarchies={[]}
                    selectedIds={[]}
                    onSelectionChange={() => {}}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Drill-down Level</label>
                <ToggleGroup type="single" disabled>
                  <ToggleGroupItem value="loading">Loading...</ToggleGroupItem>
                </ToggleGroup>
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
          <CardTitle>Purposes by Hierarchies</CardTitle>
          <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Hierarchy</label>
                <HierarchySelector
                  hierarchies={hierarchies}
                  selectedIds={selectedHierarchy ? [selectedHierarchy] : []}
                  onSelectionChange={handleHierarchySelectionChange}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Drill-down Level</label>
                <ToggleGroup 
                  type="single" 
                  value={selectedLevel} 
                  onValueChange={(value) => value && setSelectedLevel(value as any)}
                >
                  {availableLevels.map((level) => (
                    <ToggleGroupItem key={level} value={level}>
                      {level === 'DIRECT_CHILDREN' ? 'Direct Children' : level}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
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

  // Transform data for recharts
  const chartData = data.items.map((item) => ({
    name: item.name,
    value: item.count,
    fullPath: item.path
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    // Only show labels for non-zero values
    if (value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
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
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${data.payload.fullPath}`}</p>
          <p className="text-gray-600">{`Purposes: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purposes by Hierarchies</CardTitle>
        <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Hierarchy</label>
              <HierarchySelector
                hierarchies={hierarchies}
                selectedIds={selectedHierarchy ? [selectedHierarchy] : []}
                onSelectionChange={handleHierarchySelectionChange}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Drill-down Level</label>
              <ToggleGroup 
                type="single" 
                value={selectedLevel} 
                onValueChange={(value) => value && setSelectedLevel(value as any)}
              >
                {availableLevels.map((level) => (
                  <ToggleGroupItem key={level} value={level}>
                    {level === 'DIRECT_CHILDREN' ? 'Direct Children' : level}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>
        <div className="h-[400px] flex">
          <div className="flex-[2]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex flex-col space-y-2 pl-4">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
