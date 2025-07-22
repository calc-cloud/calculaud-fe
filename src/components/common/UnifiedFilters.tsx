import {format} from 'date-fns';
import {CalendarIcon, ChevronDown, Filter} from 'lucide-react';
import React, {useState} from 'react';

import {HierarchySelector} from '@/components/common/HierarchySelector';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Checkbox} from '@/components/ui/checkbox';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {useAdminData} from '@/contexts/AdminDataContext';
import {cn} from '@/lib/utils';
import {PURPOSE_STATUSES_DISPLAY, RELATIVE_TIME_OPTIONS, UnifiedFilters as UnifiedFiltersType} from '@/types/filters';
import {createToggleFunction, handleDateChange, handleRelativeTimeChange} from '@/utils/filterUtils';

// UI Components


// Helper function to count active filters
const countActiveFilters = (filters: UnifiedFiltersType) => {
  return [
    // Count relative time only if it's not the default
    ...(filters.relative_time && filters.relative_time !== 'all_time' ? [1] : []),
    // Count each individual hierarchy selection
    ...(filters.hierarchy_id || []),
    // Count each individual service type selection
    ...(filters.service_type || []),
    // Count each individual status selection
    ...(filters.status || []),
    // Count each individual supplier selection
    ...(filters.supplier || []),
    // Count each individual material selection
    ...(filters.material || []),
  ].length;
};

interface UnifiedFiltersProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
}

// Base UnifiedFilters component (for drawer content)
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

  // Function to reset relative time filter to default
  const _clearRelativeTime = () => {
    onFiltersChange({
      ...filters,
      relative_time: 'all_time',
      start_date: undefined,
      end_date: undefined
    });
  };

  // Filter materials based on selected service types
  const filteredMaterials = React.useMemo(() => {
    if (!filters.service_type || filters.service_type.length === 0) {
      // If no service types are selected, show all materials
      return materials;
    }
    
    // Filter materials to only show those related to selected service types
    return materials.filter(material => 
      filters.service_type?.includes(material.service_type_id) || false
    );
  }, [materials, filters.service_type]);

  return (
    <div className="space-y-4">
      {/* Date Range Controls */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">From:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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

            <span className="text-muted-foreground px-1 pb-2">—</span>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">To:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Relative Time:</label>
            <Select
                value={filters.relative_time || 'all_time'}
              onValueChange={(relativeTime) => handleRelativeTimeChange(relativeTime, filters, onFiltersChange)}
            >
              <SelectTrigger className="w-full">
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
      </div>

      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="space-y-2">
          {/* Hierarchy Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hierarchy:</label>
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

          {/* Service Type Multi-Select */}
          <div className="border-t border-gray-200 pt-3 border-b border-gray-200 pb-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1" disabled={isLoading}>
                <span>{isLoading ? 'Loading...' : 'Service Types'}</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3 pl-1">
                {serviceTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center space-x-3 cursor-pointer py-1"
                    onClick={() => toggleServiceType(type.id)}
                  >
                    <Checkbox
                      checked={(filters.service_type || []).includes(type.id)}
                    />
                    <span className="text-sm">{type.name}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Material Multi-Select */}
          <div className="border-b border-gray-200 pb-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1" disabled={isLoading}>
                <span>
                  {isLoading ? 'Loading...' : 'Materials'}
                  {filters.service_type && filters.service_type.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">
                      (filtered by {filters.service_type.length} service type{filters.service_type.length > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3 pl-1 max-h-60 overflow-y-auto">
                {filteredMaterials.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 px-1">
                    {filters.service_type && filters.service_type.length > 0 
                      ? 'No materials found for selected service types'
                      : 'No materials available'
                    }
                  </div>
                ) : (
                  <>
                    {filteredMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center space-x-3 cursor-pointer py-1"
                        onClick={() => toggleMaterial(material.id)}
                      >
                        <Checkbox
                          checked={(filters.material || []).includes(material.id)}
                        />
                        <span className="text-sm truncate">{material.name}</span>
                      </div>
                    ))}
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Supplier Multi-Select */}
          <div className="border-b border-gray-200 pb-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1" disabled={isLoading}>
                <span>{isLoading ? 'Loading...' : 'Suppliers'}</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3 pl-1 max-h-60 overflow-y-auto">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center space-x-3 cursor-pointer py-1"
                    onClick={() => toggleSupplier(supplier.id)}
                  >
                    <Checkbox
                      checked={(filters.supplier || []).includes(supplier.id)}
                    />
                    <span className="text-sm truncate">{supplier.name}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Status Multi-Select */}
          <div className="pb-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1">
                <span>Statuses</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3 pl-1">
                {PURPOSE_STATUSES_DISPLAY.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-3 cursor-pointer py-1"
                    onClick={() => toggleStatus(status)}
                  >
                    <Checkbox
                      checked={(filters.status || []).includes(status)}
                    />
                    <Badge variant={status === 'Completed' || status === 'Signed' ? 'default' : 'secondary'} className="text-xs">
                      {status}
                    </Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
};

// FiltersDrawer component that wraps UnifiedFilters in a Sheet
interface FiltersDrawerProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
  triggerText?: string;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  filters,
  onFiltersChange,
  triggerText = "Filters"
}) => {
  const [open, setOpen] = useState(false);
  const activeFiltersCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {triggerText}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <UnifiedFilters 
            filters={filters} 
            onFiltersChange={onFiltersChange} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}; 