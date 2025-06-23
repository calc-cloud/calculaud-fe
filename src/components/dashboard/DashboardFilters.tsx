
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X, ChevronDown, CalendarIcon } from 'lucide-react';
import { DashboardFilters as DashboardFiltersType } from '@/types/analytics';
import { HierarchySelector } from '@/components/common/HierarchySelector';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: DashboardFiltersType) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { hierarchies, suppliers, serviceTypes, services, isLoading } = useAdminData();

  const updateFilter = (key: keyof DashboardFiltersType, value: string | number[] | string[] | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
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
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  ).length;

  const getServiceTypeLabel = () => {
    const selectedTypes = filters.service_type_ids || [];
    if (selectedTypes.length === 0) return 'Service Types';
    if (selectedTypes.length === 1) {
      const serviceType = serviceTypes.find(st => st.id === selectedTypes[0]);
      return serviceType?.name || 'Service Types';
    }
    return `${selectedTypes.length} selected`;
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

  const PURPOSE_STATUSES = ['IN_PROGRESS', 'COMPLETED'];

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold">Filters</h3>
      
      {/* Date Range */}
      <div className="flex items-center gap-3">
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
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.start_date ? format(new Date(filters.start_date), "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.start_date ? new Date(filters.start_date) : undefined}
                onSelect={(date) => updateFilter('start_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
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
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.end_date ? format(new Date(filters.end_date), "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.end_date ? new Date(filters.end_date) : undefined}
                onSelect={(date) => updateFilter('end_date', date ? format(date, 'yyyy-MM-dd') : undefined)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-3 overflow-x-auto p-1">
        {/* Hierarchy Selector */}
        <div className="flex-shrink-0 min-w-[200px]">
          <HierarchySelector
            hierarchies={hierarchies.map(h => ({ ...h, id: h.id.toString() }))}
            selectedIds={(filters.hierarchy_ids || []).map(id => id.toString())}
            onSelectionChange={(selectedIds) => 
              updateFilter('hierarchy_ids', selectedIds.length > 0 ? selectedIds.map(id => parseInt(id)) : undefined)
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

        {/* Supplier Multi-Select Dropdown */}
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
        </div>
      </div>
    </div>
  );
};
