
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, ChevronDown, CalendarIcon } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { PurposeFilters } from '@/types';
import { HierarchySelector } from './HierarchySelector';
import { useAdminData } from '@/contexts/AdminDataContext';

interface FilterBarProps {
  filters: PurposeFilters;
  onFiltersChange: (filters: PurposeFilters) => void;
  onExport: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  const { hierarchies, suppliers, serviceTypes, materials, isLoading } = useAdminData();

  const updateFilter = (key: keyof PurposeFilters, value: string | string[] | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    
    onFiltersChange(newFilters);
  };

  const toggleServiceType = (serviceTypeName: string) => {
    const currentTypes = filters.service_type || [];
    const updatedTypes = currentTypes.includes(serviceTypeName as any)
      ? currentTypes.filter(type => type !== serviceTypeName)
      : [...currentTypes, serviceTypeName as any];
    
    updateFilter('service_type', updatedTypes.length > 0 ? updatedTypes : undefined);
  };

  const toggleStatus = (status: any) => {
    const currentStatuses = filters.status || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', updatedStatuses.length > 0 ? updatedStatuses : undefined);
  };

  const toggleSupplier = (supplierName: string) => {
    const currentSuppliers = filters.supplier || [];
    const updatedSuppliers = currentSuppliers.includes(supplierName as any)
      ? currentSuppliers.filter(s => s !== supplierName)
      : [...currentSuppliers, supplierName as any];
    
    updateFilter('supplier', updatedSuppliers.length > 0 ? updatedSuppliers : undefined);
  };

  const toggleMaterial = (materialName: string) => {
    const currentMaterials = filters.material || [];
    const updatedMaterials = currentMaterials.includes(materialName)
      ? currentMaterials.filter(m => m !== materialName)
      : [...currentMaterials, materialName];
    
    updateFilter('material', updatedMaterials.length > 0 ? updatedMaterials : undefined);
  };

  // Calculate date range based on relative time selection
  const calculateDateRange = (relativeTime: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (relativeTime) {
      case 'last_7_days':
        startDate = subDays(today, 7);
        break;
      case 'last_30_days':
        startDate = subDays(today, 30);
        break;
      case 'last_3_months':
        startDate = subMonths(today, 3);
        break;
      case 'last_6_months':
        startDate = subMonths(today, 6);
        break;
      case 'last_year':
        startDate = subYears(today, 1);
        break;
      case 'this_week':
        startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        break;
      case 'this_month':
        startDate = startOfMonth(today);
        break;
      case 'this_year':
        startDate = startOfYear(today);
        break;
      case 'all_time':
        // For "All Time", clear the date filters by returning undefined
        return undefined;
      default:
        return; // Don't update dates for custom or unknown values
    }

    return {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    };
  };

  // Handle relative time change
  const handleRelativeTimeChange = (relativeTime: string) => {
    const dateRange = calculateDateRange(relativeTime);
    
    let newFilters = {
      ...filters,
      relative_time: relativeTime
    };

    if (relativeTime === 'all_time') {
      // For "All Time", remove date constraints
      newFilters = {
        ...filters,
        relative_time: relativeTime,
        start_date: undefined,
        end_date: undefined
      };
    } else if (dateRange) {
      // For other relative times, update with calculated dates
      newFilters = {
        ...filters,
        relative_time: relativeTime,
        ...dateRange
      };
    }
    
    onFiltersChange(newFilters);
  };

  // Handle manual date changes (should set relative_time to 'custom')
  const handleDateChange = (key: 'start_date' | 'end_date', value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value,
      relative_time: 'custom' // Set to custom when manually changing dates
    };
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    // Reset to default state with "Last Year" relative time and corresponding date range
    const defaultDateRange = calculateDateRange('last_year');
    const defaultFilters = {
      relative_time: 'last_year',
      ...defaultDateRange
    };
    onFiltersChange(defaultFilters);
  };

  // Calculate active filters count, excluding default values (same logic as dashboard)
  const getActiveFiltersCount = () => {
    // Get default state for comparison
    const defaultDateRange = calculateDateRange('last_year');
    const isDefaultDateRange = filters.start_date === defaultDateRange?.start_date && 
                              filters.end_date === defaultDateRange?.end_date;
    const isDefaultRelativeTime = (filters.relative_time || 'last_year') === 'last_year';
    
    let count = 0;
    
    // Only count non-default filters
    if (filters.search_query?.trim()) count++;
    if (filters.service_type?.length) count++;
    if (filters.status?.length) count++;
    if (filters.supplier?.length) count++;
    if (filters.material?.length) count++;
    if (filters.hierarchy_id) {
      const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
      if (hierarchyIds.length > 0) count++;
    }
    
    // Only count date/time filters if they're not the default
    if (!isDefaultDateRange || !isDefaultRelativeTime) {
      if (filters.relative_time === 'custom') {
        count++; // Custom date range
      } else if (filters.relative_time && filters.relative_time !== 'last_year') {
        count++; // Non-default relative time
      }
    }
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getServiceTypeLabel = () => {
    const selectedTypes = filters.service_type || [];
    if (selectedTypes.length === 0) return 'Service Types';
    if (selectedTypes.length === 1) return selectedTypes[0];
    return `${selectedTypes.length} selected`;
  };

  const getStatusLabel = () => {
    const selectedStatuses = filters.status || [];
    if (selectedStatuses.length === 0) return 'Statuses';
    if (selectedStatuses.length === 1) return selectedStatuses[0];
    return `${selectedStatuses.length} selected`;
  };

  const getSupplierLabel = () => {
    const selectedSuppliers = filters.supplier || [];
    if (selectedSuppliers.length === 0) return 'Suppliers';
    if (selectedSuppliers.length === 1) return selectedSuppliers[0];
    return `${selectedSuppliers.length} selected`;
  };

  const getMaterialLabel = () => {
    const selectedMaterials = filters.material || [];
    if (selectedMaterials.length === 0) return 'Materials';
    if (selectedMaterials.length === 1) return selectedMaterials[0];
    return `${selectedMaterials.length} selected`;
  };

  const PURPOSE_STATUSES = ['In Progress', 'Completed'];

  // Relative time options
  const RELATIVE_TIME_OPTIONS = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'all_time', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by description, content, or EMF ID..."
          value={filters.search_query || ''}
          onChange={(e) => updateFilter('search_query', e.target.value)}
          className="pl-10 focus-visible:outline-none"
        />
      </div>

      {/* Date Range with Relative Time Filter */}
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !filters.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {filters.start_date ? format(new Date(filters.start_date), "dd/MM/yyyy") : "Start date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.start_date ? new Date(filters.start_date) : undefined}
                onSelect={(date) => handleDateChange('start_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !filters.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {filters.end_date ? format(new Date(filters.end_date), "dd/MM/yyyy") : "End date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.end_date ? new Date(filters.end_date) : undefined}
                onSelect={(date) => handleDateChange('end_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Relative Time Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Relative Time:</label>
          <Select
            value={filters.relative_time || 'last_year'}
            onValueChange={handleRelativeTimeChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {RELATIVE_TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Controls */}
      <TooltipProvider>
        <div className="flex items-center gap-3 overflow-x-auto p-1">
        {/* Hierarchy Selector */}
        <div className="flex-shrink-0 min-w-[200px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <HierarchySelector
                  hierarchies={hierarchies}
                  selectedIds={Array.isArray(filters.hierarchy_id) ? 
                    filters.hierarchy_id.map(id => typeof id === 'string' ? parseInt(id) : id) : 
                    (filters.hierarchy_id ? [typeof filters.hierarchy_id === 'string' ? parseInt(filters.hierarchy_id) : filters.hierarchy_id] : [])}
                  onSelectionChange={(selectedIds) => 
                    updateFilter('hierarchy_id', selectedIds.length > 0 ? selectedIds.map(id => id.toString()) : undefined)
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{(() => {
                const selectedIds = Array.isArray(filters.hierarchy_id) ? 
                  filters.hierarchy_id.map(id => typeof id === 'string' ? parseInt(id) : id) : 
                  (filters.hierarchy_id ? [typeof filters.hierarchy_id === 'string' ? parseInt(filters.hierarchy_id) : filters.hierarchy_id] : []);
                
                if (selectedIds.length === 0) return 'Hierarchy';
                if (selectedIds.length === 1) {
                  const hierarchy = hierarchies.find(h => h.id === selectedIds[0]);
                  return hierarchy ? hierarchy.path : 'Hierarchy';
                }
                return `${selectedIds.length} hierarchies selected`;
              })()}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Service Type Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between gap-2" disabled={isLoading}>
                    <span className="truncate">{isLoading ? 'Loading...' : getServiceTypeLabel()}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLoading ? 'Loading...' : getServiceTypeLabel()}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
              {serviceTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleServiceType(type.name)}
                >
                  <Checkbox
                    checked={(filters.service_type || []).includes(type.name as any)}
                  />
                  <span>{type.name}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Material Multi-Select Dropdown */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between gap-2" disabled={isLoading}>
                    <span className="truncate">{isLoading ? 'Loading...' : getMaterialLabel()}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLoading ? 'Loading...' : getMaterialLabel()}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleMaterial(material.name)}
                >
                  <Checkbox
                    checked={(filters.material || []).includes(material.name)}
                  />
                  <span className="truncate">{material.name}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Supplier Multi-Select Dropdown */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between gap-2" disabled={isLoading}>
                    <span className="truncate">{isLoading ? 'Loading...' : getSupplierLabel()}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isLoading ? 'Loading...' : getSupplierLabel()}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleSupplier(supplier.name)}
                >
                  <Checkbox
                    checked={(filters.supplier || []).includes(supplier.name as any)}
                  />
                  <span className="truncate">{supplier.name}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-between gap-2">
                    <span className="truncate">{getStatusLabel()}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getStatusLabel()}</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent className="w-[180px] p-2 bg-white border shadow-md z-50">
              {PURPOSE_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleStatus(status)}
                >
                  <Checkbox
                    checked={(filters.status || []).includes(status as any)}
                  />
                  <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
          
          <Button variant="outline" onClick={onExport}>
            Export
          </Button>
        </div>
      </div>
      </TooltipProvider>

      
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.service_type && filters.service_type.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.service_type.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  Service: {type}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleServiceType(type)}
                  />
                </Badge>
              ))}
            </div>
          )}
          {filters.status && filters.status.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.status.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  Status: {status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleStatus(status)}
                  />
                </Badge>
              ))}
            </div>
          )}
          {filters.supplier && filters.supplier.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.supplier.map((supplier) => (
                <Badge key={supplier} variant="secondary" className="flex items-center gap-1">
                  Supplier: {supplier}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleSupplier(supplier)}
                  />
                </Badge>
              ))}
            </div>
          )}
          {filters.material && filters.material.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.material.map((material) => (
                <Badge key={material} variant="secondary" className="flex items-center gap-1">
                  Material: {material}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleMaterial(material)}
                  />
                </Badge>
              ))}
            </div>
          )}
          {filters.hierarchy_id && (
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id]).map((hierarchyId) => {
                const hierarchy = hierarchies.find(h => h.id === (typeof hierarchyId === 'string' ? parseInt(hierarchyId) : hierarchyId));
                return (
                  <Badge key={hierarchyId} variant="secondary" className="flex items-center gap-1">
                    {hierarchy?.type}: {hierarchy?.name || hierarchyId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        const selectedIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
                        const updatedIds = selectedIds.filter(id => id !== hierarchyId);
                        updateFilter('hierarchy_id', updatedIds.length > 0 ? updatedIds : undefined);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
