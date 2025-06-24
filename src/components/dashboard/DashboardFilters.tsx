
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ChevronDown, CalendarIcon } from 'lucide-react';
import { DashboardFilters as DashboardFiltersType } from '@/types/analytics';
import { HierarchySelector } from '@/components/common/HierarchySelector';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, subDays, subWeeks, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
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

  const toggleService = (serviceId: number) => {
    const currentServices = filters.service_ids || [];
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    updateFilter('service_ids', updatedServices.length > 0 ? updatedServices : undefined);
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

  const getServiceLabel = () => {
    const selectedServices = filters.service_ids || [];
    if (selectedServices.length === 0) return 'Services';
    if (selectedServices.length === 1) {
      const service = services.find(s => s.id === selectedServices[0]);
      return service?.name || 'Services';
    }
    return `${selectedServices.length} selected`;
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
    { value: 'custom', label: 'Custom Range' }
  ];

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
    
    const newFilters = {
      ...filters,
      relative_time: relativeTime,
      ...(dateRange || {}) // Only update dates if dateRange is not undefined
    };
    
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

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold">Filters</h3>
      
      {/* Date Range with Relative Time Filter */}
      <div className="flex items-center gap-3">
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

        {/* Service Multi-Select */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between" disabled={isLoading}>
                {isLoading ? 'Loading...' : getServiceLabel()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => toggleService(service.id)}
                >
                  <Checkbox
                    checked={(filters.service_ids || []).includes(service.id)}
                  />
                  <span className="truncate">{service.name}</span>
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
