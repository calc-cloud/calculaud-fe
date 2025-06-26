import React from 'react';
import {format} from 'date-fns';
import {CalendarIcon, ChevronDown, X} from 'lucide-react';
import {cn} from '@/lib/utils';

// UI Components
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Checkbox} from '@/components/ui/checkbox';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';

// Components
import {HierarchySelector} from '@/components/common/HierarchySelector';

// Hooks and data
import {useAdminData} from '@/contexts/AdminDataContext';

// Types and utilities
import {
  UnifiedFilters as UnifiedFiltersType,
  PURPOSE_STATUSES_DISPLAY,
  RELATIVE_TIME_OPTIONS
} from '@/types/filters';
import {
  clearFilters,
  getActiveFiltersCount,
  getFilterLabel,
  handleDateChange,
  handleRelativeTimeChange,
  createToggleFunction
} from '@/utils/filterUtils';

interface UnifiedFiltersProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
}

export const UnifiedFilters: React.FC<UnifiedFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  // Data hooks
  const { hierarchies, suppliers, serviceTypes, materials, isLoading } = useAdminData();

  // Create toggle functions using the generic helper
  const toggleServiceType = createToggleFunction<number>('service_type', filters, onFiltersChange);
  const toggleStatus = createToggleFunction<string>('status', filters, onFiltersChange);
  const toggleSupplier = createToggleFunction<number>('supplier', filters, onFiltersChange);
  const toggleMaterial = createToggleFunction<number>('material', filters, onFiltersChange);

  const activeFiltersCount = getActiveFiltersCount(filters);

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold">Filters</h3>
      
      {/* Date Range Controls - Always shown */}
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
                onSelect={(date) => handleDateChange('start_date', date ? format(date, 'yyyy-MM-dd') : undefined, filters, onFiltersChange)}
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
                onSelect={(date) => handleDateChange('end_date', date ? format(date, 'yyyy-MM-dd') : undefined, filters, onFiltersChange)}
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
            onValueChange={(relativeTime) => handleRelativeTimeChange(relativeTime, filters, onFiltersChange)}
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
                    selectedIds={filters.hierarchy_id || []}
                    onSelectionChange={(selectedIds) => {
                      onFiltersChange({
                        ...filters,
                        hierarchy_id: selectedIds.length > 0 ? selectedIds : undefined
                      });
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
                        filters.service_type?.map(id => serviceTypes.find(st => st.id === id)?.name).filter(Boolean),
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
                      checked={(filters.service_type || []).includes(type.id)}
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
                        filters.material?.map(id => materials.find(m => m.id === id)?.name).filter(Boolean),
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
                      checked={(filters.material || []).includes(material.id)}
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
                        filters.supplier?.map(id => suppliers.find(s => s.id === id)?.name).filter(Boolean),
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
                      checked={(filters.supplier || []).includes(supplier.id)}
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
                {PURPOSE_STATUSES_DISPLAY.map((status) => (
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
              <Button variant="outline" size="sm" onClick={() => clearFilters(onFiltersChange, filters)}>
                <X className="h-4 w-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Active Filters Display - Always shown when there are active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.service_type && filters.service_type.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.service_type.map((typeId) => {
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
          {filters.supplier && filters.supplier.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.supplier.map((supplierId) => {
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
          {filters.material && filters.material.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.material.map((materialId) => {
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