import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, ChevronDown, CalendarIcon } from 'lucide-react';
import { BaseFilters, SearchFilters, RELATIVE_TIME_OPTIONS, PURPOSE_STATUSES } from '@/types/commonFilters';
import { HierarchySelector } from './HierarchySelector';
import { useAdminData } from '@/contexts/AdminDataContext';
import { format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface UnifiedFiltersProps {
  filters: BaseFilters | SearchFilters;
  onFiltersChange: (filters: BaseFilters | SearchFilters) => void;
  showSearch?: boolean; // Only controls if search input is shown
  onExport?: () => void;
  showBackground?: boolean;
}

export const UnifiedFilters: React.FC<UnifiedFiltersProps> = ({
  filters,
  onFiltersChange,
  showSearch = false,
  onExport,
  showBackground = false
}) => {
  const { hierarchies, suppliers, serviceTypes, materials, isLoading } = useAdminData();

  const updateFilter = (key: keyof (BaseFilters & SearchFilters), value: string | number[] | string[] | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    
    onFiltersChange(newFilters);
  };

  // Calculate date range based on relative time selection
  const calculateDateRange = (relativeTime: string) => {
    const today = new Date();
    let startDate: Date;
    const endDate: Date = today;

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
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'this_month':
        startDate = startOfMonth(today);
        break;
      case 'this_year':
        startDate = startOfYear(today);
        break;
      case 'all_time':
        // For "All Time", we don't set any date filters (return undefined dates)
        return {
          start_date: undefined,
          end_date: undefined
        };
      default:
        return;
    }

    return {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    };
  };

  // Handle relative time change
  const handleRelativeTimeChange = (relativeTime: string) => {
    const dateRange = calculateDateRange(relativeTime);
    
    const newFilters = {
      ...filters,
      relative_time: relativeTime,
      ...(dateRange || {})
    };
    
    onFiltersChange(newFilters);
  };

  // Handle manual date changes
  const handleDateChange = (key: 'start_date' | 'end_date', value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value,
      relative_time: 'custom'
    };
    
    onFiltersChange(newFilters);
  };

  const toggleServiceType = (serviceTypeId: number) => {
    const currentTypes = filters.service_type_ids || [];
    const updatedTypes = currentTypes.includes(serviceTypeId)
      ? currentTypes.filter(id => id !== serviceTypeId)
      : [...currentTypes, serviceTypeId];
    
    updateFilter('service_type_ids', updatedTypes.length > 0 ? updatedTypes : undefined);
  };

  const toggleMaterial = (materialId: number) => {
    // Materials filter is available on both pages
    const currentMaterials = filters.service_ids || [];
    const updatedMaterials = currentMaterials.includes(materialId)
      ? currentMaterials.filter((id: number) => id !== materialId)
      : [...currentMaterials, materialId];
    
    updateFilter('service_ids', updatedMaterials.length > 0 ? updatedMaterials : undefined);
  };

  const toggleStatus = (status: string) => {
    const currentStatuses = filters.status || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', updatedStatuses.length > 0 ? updatedStatuses : undefined);
  };

  const toggleSupplier = (supplierId: number) => {
    const currentSuppliers = filters.supplier_ids || [];
    const updatedSuppliers = currentSuppliers.includes(supplierId)
      ? currentSuppliers.filter(id => id !== supplierId)
      : [...currentSuppliers, supplierId];
    
    updateFilter('supplier_ids', updatedSuppliers.length > 0 ? updatedSuppliers : undefined);
  };

  const clearFilters = () => {
    // Reset to default state with "All Time" for both pages
    const defaultFilters = {
      relative_time: 'all_time'
      // No date range for "All Time"
    };
    onFiltersChange(defaultFilters);
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (filters.hierarchy_ids && filters.hierarchy_ids.length > 0) count++;
    if (filters.service_type_ids && filters.service_type_ids.length > 0) count++;
    if (filters.supplier_ids && filters.supplier_ids.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    
    // Count materials (available on both pages)
    if (filters.service_ids && filters.service_ids.length > 0) count++;
    
    // Count search query if it exists
    if ((filters as SearchFilters).search_query && (filters as SearchFilters).search_query.trim()) count++;
    
    // Count date filters (except default "All Time")
    const isDefaultRelativeTime = (filters.relative_time || 'all_time') === 'all_time';
    const hasSpecificDates = filters.start_date || filters.end_date;
    const hasNonDefaultRelativeTime = filters.relative_time && filters.relative_time !== 'all_time';
    
    if (hasSpecificDates || hasNonDefaultRelativeTime) {
      count++;
    }
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getServiceTypeLabel = () => {
    const selectedTypes = filters.service_type_ids || [];
    if (selectedTypes.length === 0) return 'Service Types';
    if (selectedTypes.length === 1) {
      const serviceType = serviceTypes.find(st => st.id === selectedTypes[0]);
      return serviceType?.name || 'Service Types';
    }
    return `${selectedTypes.length} selected`;
  };

  const getMaterialLabel = () => {
    const selectedMaterials = filters.service_ids || [];
    if (selectedMaterials.length === 0) return 'Materials';
    if (selectedMaterials.length === 1) {
      const material = materials.find(m => m.id === selectedMaterials[0]);
      return material?.name || 'Materials';
    }
    return `${selectedMaterials.length} selected`;
  };

  const getStatusLabel = () => {
    const selectedStatuses = filters.status || [];
    if (selectedStatuses.length === 0) return 'Statuses';
    if (selectedStatuses.length === 1) return selectedStatuses[0];
    return `${selectedStatuses.length} selected`;
  };

  const getSupplierLabel = () => {
    const selectedSuppliers = filters.supplier_ids || [];
    if (selectedSuppliers.length === 0) return 'Suppliers';
    if (selectedSuppliers.length === 1) {
      const supplier = suppliers.find(s => s.id === selectedSuppliers[0]);
      return supplier?.name || 'Suppliers';
    }
    return `${selectedSuppliers.length} selected`;
  };

  const containerClasses = showBackground 
    ? "space-y-4 bg-white p-6 rounded-lg shadow-sm border"
    : "space-y-4";

  return (
    <div className={containerClasses}>
      {showBackground && <h3 className="text-lg font-semibold">Filters</h3>}
      
      {/* Search Bar - Only when showSearch is true */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, content, or EMF ID..."
            value={(filters as SearchFilters).search_query || ''}
            onChange={(e) => updateFilter('search_query' as keyof (BaseFilters & SearchFilters), e.target.value)}
            className="pl-10 focus-visible:outline-none"
          />
        </div>
      )}

      {/* Date Range Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
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
                  "w-[140px] justify-start text-left font-normal",
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

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Quick:</label>
          <Select
            value={filters.relative_time || 'all_time'}
            onValueChange={handleRelativeTimeChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
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
      <div className="flex items-center gap-3 overflow-x-auto p-1">
        {/* Hierarchy Selector */}
        <div className="flex-shrink-0 min-w-[200px]">
          <HierarchySelector
            hierarchies={hierarchies}
            selectedIds={filters.hierarchy_ids || []}
            onSelectionChange={(selectedIds) => 
              updateFilter('hierarchy_ids', selectedIds.length > 0 ? selectedIds : undefined)
            }
          />
        </div>

        {/* Service Type Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between" disabled={isLoading}>
                {isLoading ? 'Loading...' : getServiceTypeLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
              {serviceTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleServiceType(type.id)}
                >
                  <Checkbox
                    checked={(filters.service_type_ids || []).includes(type.id)}
                  />
                  <span>{type.name}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Material Multi-Select - Available on both pages */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between" disabled={isLoading}>
                {isLoading ? 'Loading...' : getMaterialLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleMaterial(material.id)}
                >
                  <Checkbox
                    checked={(filters.service_ids || []).includes(material.id)}
                  />
                  <span className="truncate">{material.name}</span>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-between">
                {getStatusLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px] p-2 bg-white border shadow-md z-50">
              {PURPOSE_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleStatus(status)}
                >
                  <Checkbox
                    checked={(filters.status || []).includes(status)}
                  />
                  <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Supplier Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between" disabled={isLoading}>
                {isLoading ? 'Loading...' : getSupplierLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleSupplier(supplier.id)}
                >
                  <Checkbox
                    checked={(filters.supplier_ids || []).includes(supplier.id)}
                  />
                  <span className="truncate">{supplier.name}</span>
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
          
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {/* Service Type Badges */}
          {filters.service_type_ids && filters.service_type_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.service_type_ids.map((typeId) => {
                const serviceType = serviceTypes.find(st => st.id === typeId);
                return (
                  <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                    Service: {serviceType?.name || typeId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleServiceType(typeId)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Material Badges - Available on both pages */}
          {filters.service_ids && filters.service_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.service_ids.map((materialId: number) => {
                const material = materials.find(m => m.id === materialId);
                return (
                  <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                    Material: {material?.name || materialId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleMaterial(materialId)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Status Badges */}
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

          {/* Supplier Badges */}
          {filters.supplier_ids && filters.supplier_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.supplier_ids.map((supplierId) => {
                const supplier = suppliers.find(s => s.id === supplierId);
                return (
                  <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                    Supplier: {supplier?.name || supplierId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleSupplier(supplierId)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Hierarchy Badges */}
          {filters.hierarchy_ids && filters.hierarchy_ids.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.hierarchy_ids.map((hierarchyId) => {
                const hierarchy = hierarchies.find(h => h.id === hierarchyId);
                return (
                  <Badge key={hierarchyId} variant="secondary" className="flex items-center gap-1">
                    {hierarchy?.type}: {hierarchy?.name || hierarchyId}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        const updatedIds = (filters.hierarchy_ids || []).filter(id => id !== hierarchyId);
                        updateFilter('hierarchy_ids', updatedIds.length > 0 ? updatedIds : undefined);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Date Badge */}
          {(filters.start_date || filters.end_date) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.start_date && format(new Date(filters.start_date), "dd/MM/yy")}
              {filters.start_date && filters.end_date && " - "}
              {filters.end_date && format(new Date(filters.end_date), "dd/MM/yy")}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  updateFilter('start_date', undefined);
                  updateFilter('end_date', undefined);
                  updateFilter('relative_time', undefined);
                }}
              />
            </Badge>
          )}

          {/* Relative Time Badge (when no specific dates and not default "All Time") */}
          {filters.relative_time && !filters.start_date && !filters.end_date && filters.relative_time !== 'all_time' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {RELATIVE_TIME_OPTIONS.find(opt => opt.value === filters.relative_time)?.label || filters.relative_time}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('relative_time', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};