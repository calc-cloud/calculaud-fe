import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Components
import { HierarchySelector } from '@/components/common/HierarchySelector';

// Hooks and data
import { useAdminData } from '@/contexts/AdminDataContext';

// Types and utilities
import { 
  UnifiedFilters as UnifiedFiltersType, 
  FilterComponentProps, 
  RELATIVE_TIME_OPTIONS, 
  PURPOSE_STATUSES_DISPLAY 
} from '@/types/filters';
import {
  calculateDateRange,
  handleRelativeTimeChange,
  handleDateChange,
  clearFilters,
  getActiveFiltersCount,
  toggleArrayItem,
  getFilterLabel
} from '@/utils/filterUtils';

export const UnifiedFilters: React.FC<FilterComponentProps> = ({
  filters,
  onFiltersChange,
  onExport,
  config
}) => {
  // Data hooks
  const { hierarchies, suppliers, serviceTypes, materials, isLoading } = useAdminData();

  // Update filter helper
  const updateFilter = (key: keyof UnifiedFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  // Toggle functions for multi-select filters
  const toggleServiceType = (item: string | number) => {
    const currentArray = filters.service_type || [];
    const newArray = toggleArrayItem(currentArray, item);
    updateFilter('service_type', newArray.length > 0 ? newArray : undefined);
  };

  const toggleStatus = (status: string) => {
    const currentArray = filters.status || [];
    const newArray = toggleArrayItem(currentArray, status);
    updateFilter('status', newArray.length > 0 ? newArray : undefined);
  };

  const toggleSupplier = (item: string | number) => {
    const currentArray = filters.supplier || [];
    const newArray = toggleArrayItem(currentArray, item);
    updateFilter('supplier', newArray.length > 0 ? newArray : undefined);
  };

  const toggleMaterial = (item: string | number) => {
    const currentArray = filters.material || [];
    const newArray = toggleArrayItem(currentArray, item);
    updateFilter('material', newArray.length > 0 ? newArray : undefined);
  };

  // Event handlers
  const handleRelativeTimeChangeInternal = (relativeTime: string) => {
    handleRelativeTimeChange(relativeTime, filters, onFiltersChange);
  };

  const handleDateChangeInternal = (key: 'start_date' | 'end_date', value: string | undefined) => {
    handleDateChange(key, value, filters, onFiltersChange);
  };

  const handleClearFilters = () => {
    clearFilters(onFiltersChange);
  };

  const activeFiltersCount = getActiveFiltersCount(filters, config.mode);
  const statuses = PURPOSE_STATUSES_DISPLAY;

  const containerClass = config.mode === 'dashboard' 
    ? "space-y-4 bg-white p-6 rounded-lg shadow-sm border"
    : "space-y-4";

  return (
    <div className={cn(containerClass, config.containerClassName)}>
      {config.mode === 'dashboard' && (
        <h3 className="text-lg font-semibold">Filters</h3>
      )}
      
      {config.showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, content, or EMF ID..."
            value={filters.search_query || ''}
            onChange={(e) => updateFilter('search_query', e.target.value)}
            className="pl-10 focus-visible:outline-none"
          />
        </div>
      )}

      {config.showDateRange !== false && (
        <div className={cn(
          "flex items-center gap-3",
          config.mode === 'search' ? "overflow-x-auto py-1" : ""
        )}>
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
                  onSelect={(date) => handleDateChangeInternal('start_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
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
                  onSelect={(date) => handleDateChangeInternal('end_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Relative Time:</label>
            <Select
              value={filters.relative_time || 'last_year'}
              onValueChange={handleRelativeTimeChangeInternal}
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
      )}

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
                    selectedIds={(() => {
                      const ids = filters.hierarchy_id;
                      if (Array.isArray(ids)) {
                        return ids.map(id => typeof id === 'string' ? parseInt(id) : id);
                      }
                      return ids ? [typeof ids === 'string' ? parseInt(ids) : ids] : [];
                    })()}
                    onSelectionChange={(selectedIds) => {
                      if (config.mode === 'dashboard') {
                        updateFilter('hierarchy_id', selectedIds.length > 0 ? selectedIds : undefined);
                      } else {
                        updateFilter('hierarchy_id', selectedIds.length > 0 ? selectedIds.map(id => id.toString()) : undefined);
                      }
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hierarchy</p>
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
                      <span className="truncate">{isLoading ? 'Loading...' : getFilterLabel(
                        (filters.service_type as number[])?.map(id => serviceTypes.find(st => st.id === id)?.name).filter(Boolean),
                        'Service Types'
                      )}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Service Types</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
                {serviceTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => toggleServiceType(type.id)}
                  >
                    <Checkbox
                      checked={((filters.service_type as number[]) || []).includes(type.id)}
                    />
                    <span>{type.name}</span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Material Multi-Select */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between gap-2" disabled={isLoading}>
                      <span className="truncate">{isLoading ? 'Loading...' : getFilterLabel(
                        (filters.material as number[])?.map(id => materials.find(m => m.id === id)?.name).filter(Boolean),
                        'Materials'
                      )}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Materials</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => toggleMaterial(material.id)}
                  >
                    <Checkbox
                      checked={((filters.material as number[]) || []).includes(material.id)}
                    />
                    <span className="truncate">{material.name}</span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Supplier Multi-Select */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between gap-2" disabled={isLoading}>
                      <span className="truncate">{isLoading ? 'Loading...' : getFilterLabel(
                        (filters.supplier as number[])?.map(id => suppliers.find(s => s.id === id)?.name).filter(Boolean),
                        'Suppliers'
                      )}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suppliers</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => toggleSupplier(supplier.id)}
                  >
                    <Checkbox
                      checked={((filters.supplier as number[]) || []).includes(supplier.id)}
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
                      <span className="truncate">{getFilterLabel(filters.status, 'Statuses')}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Statuses</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="w-[180px] p-2 bg-white border shadow-md z-50">
                {statuses.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                    onClick={() => toggleStatus(status)}
                  >
                    <Checkbox
                      checked={(filters.status || []).includes(status)}
                    />
                    <Badge variant={status.includes('COMPLETED') || status === 'Completed' ? 'default' : 'secondary'}>
                      {status}
                    </Badge>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            )}
            
            {config.showExport && onExport && (
              <Button variant="outline" onClick={onExport}>
                Export
              </Button>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Active Filters Display for Search Mode */}
      {config.mode === 'search' && activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.service_type && (filters.service_type as number[]).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(filters.service_type as number[]).map((typeId) => {
                const type = serviceTypes.find(st => st.id === typeId);
                return type ? (
                  <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                    Service: {type.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleServiceType(typeId)}
                    />
                  </Badge>
                ) : null;
              })}
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
          {filters.supplier && (filters.supplier as number[]).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(filters.supplier as number[]).map((supplierId) => {
                const supplier = suppliers.find(s => s.id === supplierId);
                return supplier ? (
                  <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                    Supplier: {supplier.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleSupplier(supplierId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
          {filters.material && (filters.material as number[]).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(filters.material as number[]).map((materialId) => {
                const material = materials.find(m => m.id === materialId);
                return material ? (
                  <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                    Material: {material.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleMaterial(materialId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 