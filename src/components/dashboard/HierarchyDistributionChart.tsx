import { ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { HierarchySelector } from '@/components/common/HierarchySelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminData } from '@/contexts/AdminDataContext';
import { HierarchyDistributionResponse, DashboardFilters } from '@/types/analytics';

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
  const navigate = useNavigate();

  const handleViewInSearch = () => {
    const currentParams = new URLSearchParams(window.location.search);
    navigate(`/search?${currentParams.toString()}`);
  };
  const [selectedHierarchy, setSelectedHierarchy] = useState<number | undefined>();
  const [selectedLevel, setSelectedLevel] = useState<'UNIT' | 'CENTER' | 'ANAF' | 'MADOR' | 'TEAM' | 'DIRECT_CHILDREN'>('DIRECT_CHILDREN');

  // Filter out TEAM type hierarchies for the selector
  const filteredHierarchies = hierarchies.filter(hierarchy => hierarchy.type !== 'TEAM');

  // Get available drill-down levels based on selected hierarchy
  const getAvailableLevels = () => {
    const levels = ['DIRECT_CHILDREN'];
    
    if (!selectedHierarchy) {
      // When no hierarchy is selected, pie chart shows all UNIT hierarchies
      // So drill-down options should be CENTER, ANAF, MADOR, TEAM
      levels.push('CENTER', 'ANAF', 'MADOR', 'TEAM');
    } else {
      const hierarchy = filteredHierarchies.find(h => h.id === selectedHierarchy);
      if (hierarchy) {
        const currentLevelIndex = HIERARCHY_LEVELS.indexOf(hierarchy.type as any);
        // Show hierarchy types that are two levels under the selected hierarchy type
        // For example: CENTER (index 1) -> MADOR (index 3), TEAM (index 4)
        const startIndex = currentLevelIndex + 2;
        if (startIndex < HIERARCHY_LEVELS.length) {
          // Add all levels from two levels down to the end
          const availableHierarchyLevels = HIERARCHY_LEVELS.slice(startIndex);
          levels.push(...availableHierarchyLevels);
        }
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

  // Reset level to Direct Children when hierarchy changes
  useEffect(() => {
    setSelectedLevel('DIRECT_CHILDREN');
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

  // Handle pie segment click
  const handlePieClick = (data: any) => {
    // Check if the clicked item is a TEAM type - if so, don't make it clickable
    if (data.type === 'TEAM') {
      return;
    }
    
    // Find the hierarchy by name from the admin context
    const clickedHierarchy = filteredHierarchies.find(h => h.name === data.name);
    
    if (clickedHierarchy) {
      // Set the selected hierarchy and reset drill-down level
      setSelectedHierarchy(clickedHierarchy.id);
      setSelectedLevel('DIRECT_CHILDREN');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purposes by Hierarchies</CardTitle>
              <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
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
              <CardTitle>Purposes by Hierarchies</CardTitle>
              <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
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
                <label className="text-sm font-medium mb-2 block">Select Hierarchy</label>
                <HierarchySelector
                  hierarchies={filteredHierarchies}
                  selectedIds={selectedHierarchy ? [selectedHierarchy] : []}
                  onSelectionChange={handleHierarchySelectionChange}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Drill-down Level</label>
                <Select 
                  value={selectedLevel} 
                  onValueChange={(value) => value && setSelectedLevel(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select drill-down level" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level === 'DIRECT_CHILDREN' ? 'Direct Children' : level}
                      </SelectItem>
                    ))}
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

  // Transform data for recharts - show all hierarchies but make TEAM types non-clickable
  const chartData = data.items.map((item) => ({
    name: item.name,
    value: item.count,
    fullPath: item.path,
    type: item.type,
    id: item.id
  })).sort((a, b) => b.value - a.value); // Sort by value in descending order

  // Check if all values are zero
  const hasData = chartData.some(item => item.value > 0);

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
      
      // Check if this hierarchy is clickable (not a TEAM type)
      const isClickable = data.payload.type !== 'TEAM';
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${data.payload.fullPath}`}</p>
          <p className="text-gray-600">{`Purposes: ${data.value}`}</p>
          {isClickable && (
            <p className="text-blue-600 text-sm mt-1 italic">Click to view this hierarchy</p>
          )}
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
            <CardTitle>Purposes by Hierarchies</CardTitle>
            <CardDescription>Distribution of purposes across organizational hierarchy</CardDescription>
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
              <label className="text-sm font-medium mb-2 block">Select Hierarchy</label>
              <HierarchySelector
                hierarchies={filteredHierarchies}
                selectedIds={selectedHierarchy ? [selectedHierarchy] : []}
                onSelectionChange={handleHierarchySelectionChange}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Drill-down Level</label>
              <Select 
                value={selectedLevel} 
                onValueChange={(value) => value && setSelectedLevel(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drill-down level" />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === 'DIRECT_CHILDREN' ? 'Direct Children' : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="h-[400px] flex">
          <div className="flex-[2]">
            {hasData ? (
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
                    onClick={handlePieClick}
                  >
                    {chartData.map((entry, index) => {
                      // Check if this entry is a TEAM type to determine cursor style
                      const isTeamType = entry.type === 'TEAM';
                      
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ 
                            cursor: isTeamType ? 'default' : 'pointer'
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No purposes found</div>
                  <div className="text-sm">No data available for the selected filters and hierarchy level</div>
                </div>
              </div>
            )}
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
