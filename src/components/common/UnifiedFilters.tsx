import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Filter, Flag, X } from "lucide-react";
import React, { useState } from "react";

import { HierarchySelector } from "@/components/common/HierarchySelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAdminData } from "@/contexts/AdminDataContext";
import { cn } from "@/lib/utils";
import { PURPOSE_STATUSES_DISPLAY, RELATIVE_TIME_OPTIONS, UnifiedFilters as UnifiedFiltersType } from "@/types/filters";
import { createToggleFunction, handleDateChange, handleRelativeTimeChange } from "@/utils/filterUtils";
import { getStatusDisplayFromLabel } from "@/utils/statusUtils";

// Filter visibility configuration interface
export interface FilterVisibilityConfig {
  showTime?: boolean;
  showHierarchy?: boolean;
  showServiceTypes?: boolean;
  showMaterials?: boolean;
  showSuppliers?: boolean;
  showStatus?: boolean;
  showPendingAuthority?: boolean;
  showFlagged?: boolean;
}

// Helper function to count active filters
const countActiveFilters = (filters: UnifiedFiltersType) => {
  return [
    // Count relative time only if it's not the default
    ...(filters.relative_time && filters.relative_time !== "all_time" ? [1] : []),
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
    // Count each individual pending authority selection
    ...(filters.pending_authority || []),
    // Count flagged filter if active
    ...(filters.flagged === true ? [1] : []),
  ].length;
};

interface UnifiedFiltersProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
  visibleFilters?: FilterVisibilityConfig;
}

// Base UnifiedFilters component (for drawer content)
export const UnifiedFilters: React.FC<UnifiedFiltersProps> = ({ filters, onFiltersChange, visibleFilters }) => {
  // Default visibility config - show all filters if not specified
  const defaultVisibility: FilterVisibilityConfig = {
    showTime: true,
    showHierarchy: true,
    showServiceTypes: true,
    showMaterials: true,
    showSuppliers: true,
    showStatus: true,
    showPendingAuthority: true,
    showFlagged: true,
  };

  const visibility = { ...defaultVisibility, ...visibleFilters };

  // Data hooks
  const { hierarchies, suppliers, serviceTypes, materials, responsibleAuthorities, isLoading } = useAdminData();

  // State for controlling date picker popovers
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Create toggle functions using the generic helper
  const toggleServiceType = createToggleFunction<number>("service_type", filters, onFiltersChange);
  const toggleStatus = createToggleFunction<string>("status", filters, onFiltersChange);
  const toggleSupplier = createToggleFunction<number>("supplier", filters, onFiltersChange);
  const toggleMaterial = createToggleFunction<number>("material", filters, onFiltersChange);
  const togglePendingAuthority = createToggleFunction<number>("pending_authority", filters, onFiltersChange);

  // Function to reset relative time filter to default
  const _clearRelativeTime = () => {
    onFiltersChange({
      ...filters,
      relative_time: "all_time",
      start_date: undefined,
      end_date: undefined,
    });
  };

  // Filter materials based on selected service types
  const filteredMaterials = React.useMemo(() => {
    if (!filters.service_type || filters.service_type.length === 0) {
      // If no service types are selected, show all materials
      return materials;
    }

    // Filter materials to only show those related to selected service types
    return materials.filter((material) => filters.service_type?.includes(material.service_type_id) || false);
  }, [materials, filters.service_type]);

  return (
    <div className="space-y-4">
      {/* Date Range Controls */}
      {visibility.showTime && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">From:</label>
                <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
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
                      onSelect={(date) => {
                        handleDateChange(
                          "start_date",
                          date ? format(date, "yyyy-MM-dd") : undefined,
                          filters,
                          onFiltersChange
                        );
                        setStartDatePickerOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <span className="text-muted-foreground px-1 pb-2">—</span>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">To:</label>
                <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
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
                      onSelect={(date) => {
                        handleDateChange(
                          "end_date",
                          date ? format(date, "yyyy-MM-dd") : undefined,
                          filters,
                          onFiltersChange
                        );
                        setEndDatePickerOpen(false);
                      }}
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
                value={filters.relative_time || "all_time"}
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
      )}

      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="space-y-2">
          {/* Hierarchy Selector */}
          {visibility.showHierarchy && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Hierarchy:</label>
              <HierarchySelector
                hierarchies={hierarchies}
                selectedIds={filters.hierarchy_id || []}
                onSelectionChange={(selectedIds) => {
                  onFiltersChange({
                    ...filters,
                    hierarchy_id: selectedIds.length > 0 ? selectedIds : undefined,
                  });
                }}
              />
            </div>
          )}

          {/* Service Type Multi-Select */}
          {visibility.showServiceTypes && (
            <div className="border-t border-gray-200 pt-3 border-b border-gray-200 pb-3">
              <Collapsible>
                <CollapsibleTrigger
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Loading..." : "Service Types"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3 pl-1">
                  {serviceTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center space-x-3 cursor-pointer py-1"
                      onClick={() => toggleServiceType(type.id)}
                    >
                      <Checkbox checked={(filters.service_type || []).includes(type.id)} />
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Material Multi-Select */}
          {visibility.showMaterials && (
            <div className="border-b border-gray-200 pb-3">
              <Collapsible>
                <CollapsibleTrigger
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? "Loading..." : "Materials"}
                    {filters.service_type && filters.service_type.length > 0 && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        (filtered by {filters.service_type.length} service type
                        {filters.service_type.length > 1 ? "s" : ""})
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3 pl-1 max-h-60 overflow-y-auto">
                  {filteredMaterials.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2 px-1">
                      {filters.service_type && filters.service_type.length > 0
                        ? "No materials found for selected service types"
                        : "No materials available"}
                    </div>
                  ) : (
                    <>
                      {filteredMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center space-x-3 cursor-pointer py-1"
                          onClick={() => toggleMaterial(material.id)}
                        >
                          <Checkbox checked={(filters.material || []).includes(material.id)} />
                          <span className="text-sm truncate">{material.name}</span>
                        </div>
                      ))}
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Supplier Multi-Select */}
          {visibility.showSuppliers && (
            <div className="border-b border-gray-200 pb-3">
              <Collapsible>
                <CollapsibleTrigger
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Loading..." : "Suppliers"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3 pl-1 max-h-60 overflow-y-auto">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center space-x-3 cursor-pointer py-1"
                      onClick={() => toggleSupplier(supplier.id)}
                    >
                      <Checkbox checked={(filters.supplier || []).includes(supplier.id)} />
                      <span className="text-sm truncate">{supplier.name}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Pending Authority Multi-Select */}
          {visibility.showPendingAuthority && (
            <div className="border-b border-gray-200 pb-3">
              <Collapsible>
                <CollapsibleTrigger
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:bg-gray-50 rounded-sm px-1"
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Loading..." : "Pending Authorities"}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3 pl-1 max-h-60 overflow-y-auto">
                  {responsibleAuthorities.map((authority) => (
                    <div
                      key={authority.id}
                      className="flex items-center space-x-3 cursor-pointer py-1"
                      onClick={() => togglePendingAuthority(authority.id)}
                    >
                      <Checkbox checked={(filters.pending_authority || []).includes(authority.id)} />
                      <span className="text-sm truncate">{authority.name}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Status Multi-Select */}
          {visibility.showStatus && (
            <div className="border-b border-gray-200 pb-3">
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
                      <Checkbox checked={(filters.status || []).includes(status)} />
                      {(() => {
                        const statusInfo = getStatusDisplayFromLabel(status);
                        return (
                          <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.className}`}>
                            {status}
                          </Badge>
                        );
                      })()}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Flagged Filter */}
          {visibility.showFlagged && (
            <div className="pb-3">
              <div
                className="flex items-center space-x-3 cursor-pointer py-2"
                onClick={() => {
                  onFiltersChange({
                    ...filters,
                    flagged: filters.flagged ? undefined : true,
                  });
                }}
              >
                <Checkbox checked={filters.flagged === true} />
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-500 fill-red-500" />
                  <span className="text-sm font-medium">Flagged</span>
                </div>
              </div>
            </div>
          )}
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
  visibleFilters?: FilterVisibilityConfig;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  filters,
  onFiltersChange,
  triggerText = "Filters",
  visibleFilters,
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
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
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
          <UnifiedFilters filters={filters} onFiltersChange={onFiltersChange} visibleFilters={visibleFilters} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

// InlineFilters component that displays filters horizontally
interface InlineFiltersProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
  visibleFilters?: FilterVisibilityConfig;
  onClearFilters?: () => void;
}

export const InlineFilters: React.FC<InlineFiltersProps> = ({
  filters,
  onFiltersChange,
  visibleFilters,
  onClearFilters,
}) => {
  // Default visibility config - show all filters if not specified
  const defaultVisibility: FilterVisibilityConfig = {
    showTime: true,
    showHierarchy: true,
    showServiceTypes: true,
    showMaterials: true,
    showSuppliers: true,
    showStatus: true,
    showPendingAuthority: true,
    showFlagged: true,
  };

  const visibility = { ...defaultVisibility, ...visibleFilters };

  // Data hooks
  const { serviceTypes } = useAdminData();

  // State for controlling date picker popovers
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Create toggle functions using the generic helper
  const toggleServiceType = createToggleFunction<number>("service_type", filters, onFiltersChange);

  // Calculate active filters count
  const activeFiltersCount = countActiveFilters(filters);

  // Helper function to remove specific filter
  const removeServiceType = (serviceTypeId: number) => {
    const updatedServiceTypes = (filters.service_type || []).filter((id) => id !== serviceTypeId);
    onFiltersChange({
      ...filters,
      service_type: updatedServiceTypes.length > 0 ? updatedServiceTypes : undefined,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Controls */}
        {visibility.showTime && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Time:</span>

            {/* Relative Time Dropdown */}
            <Select
              value={filters.relative_time || "all_time"}
              onValueChange={(relativeTime) => handleRelativeTimeChange(relativeTime, filters, onFiltersChange)}
            >
              <SelectTrigger className="w-36">
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

            {/* Custom Date Range - only show when "custom" is selected */}
            {filters.relative_time === "custom" && (
              <div className="flex items-center gap-2">
                <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal text-xs",
                        !filters.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.start_date ? format(new Date(filters.start_date), "dd/MM/yy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.start_date ? new Date(filters.start_date) : undefined}
                      onSelect={(date) => {
                        handleDateChange(
                          "start_date",
                          date ? format(date, "yyyy-MM-dd") : undefined,
                          filters,
                          onFiltersChange
                        );
                        setStartDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-sm">—</span>

                <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-32 justify-start text-left font-normal text-xs",
                        !filters.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {filters.end_date ? format(new Date(filters.end_date), "dd/MM/yy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.end_date ? new Date(filters.end_date) : undefined}
                      onSelect={(date) => {
                        handleDateChange(
                          "end_date",
                          date ? format(date, "yyyy-MM-dd") : undefined,
                          filters,
                          onFiltersChange
                        );
                        setEndDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}

        {/* Service Types Filter */}
        {visibility.showServiceTypes && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Service Types:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                  <span>
                    {filters.service_type && filters.service_type.length > 0
                      ? `${filters.service_type.length} selected`
                      : "Select service types"}
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {serviceTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center space-x-3 cursor-pointer py-1 hover:bg-gray-50 rounded px-2"
                      onClick={() => toggleServiceType(type.id)}
                    >
                      <Checkbox checked={(filters.service_type || []).includes(type.id)} />
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2 flex-shrink-0">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filter Badges Section */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Relative Time Badge */}
            {filters.relative_time && filters.relative_time !== "all_time" && (
              <Badge variant="secondary" className="gap-1">
                {RELATIVE_TIME_OPTIONS.find((opt) => opt.value === filters.relative_time)?.label ||
                  filters.relative_time}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      relative_time: "all_time",
                      start_date: undefined,
                      end_date: undefined,
                    })
                  }
                />
              </Badge>
            )}

            {/* Service Type Badges */}
            {filters.service_type?.map((serviceTypeId) => {
              const serviceType = serviceTypes.find((st) => st.id === serviceTypeId);
              return serviceType ? (
                <Badge key={serviceTypeId} variant="secondary" className="gap-1">
                  {serviceType.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeServiceType(serviceTypeId)}
                  />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
