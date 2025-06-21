
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { PurposeFilters, ServiceType, PurposeStatus, Supplier } from '@/types';
import { SERVICE_TYPES, PURPOSE_STATUSES, SUPPLIERS } from '@/utils/constants';

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
  const updateFilter = (key: keyof PurposeFilters, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const toggleServiceType = (serviceType: ServiceType) => {
    const currentTypes = filters.service_type || [];
    const updatedTypes = currentTypes.includes(serviceType)
      ? currentTypes.filter(type => type !== serviceType)
      : [...currentTypes, serviceType];
    
    updateFilter('service_type', updatedTypes.length > 0 ? updatedTypes : undefined);
  };

  const toggleStatus = (status: PurposeStatus) => {
    const currentStatuses = filters.status || [];
    const updatedStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', updatedStatuses.length > 0 ? updatedStatuses : undefined);
  };

  const toggleSupplier = (supplier: Supplier) => {
    const currentSuppliers = filters.supplier || [];
    const updatedSuppliers = currentSuppliers.includes(supplier)
      ? currentSuppliers.filter(s => s !== supplier)
      : [...currentSuppliers, supplier];
    
    updateFilter('supplier', updatedSuppliers.length > 0 ? updatedSuppliers : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  ).length;

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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by description, content, or supplier..."
          value={filters.search_query || ''}
          onChange={(e) => updateFilter('search_query', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Service Type Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-between">
              {getServiceTypeLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
            {SERVICE_TYPES.map((type) => (
              <DropdownMenuItem
                key={type}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={(filters.service_type || []).includes(type)}
                  onCheckedChange={() => toggleServiceType(type)}
                />
                <span>{type}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-between">
              {getStatusLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px] p-2 bg-white border shadow-md z-50">
            {PURPOSE_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={(filters.status || []).includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Supplier Multi-Select Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-between">
              {getSupplierLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px] p-2 bg-white border shadow-md z-50">
            {SUPPLIERS.map((supplier) => (
              <DropdownMenuItem
                key={supplier}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={(filters.supplier || []).includes(supplier)}
                  onCheckedChange={() => toggleSupplier(supplier)}
                />
                <span className="truncate">{supplier}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="Hierarchy ID"
          value={filters.hierarchy_id || ''}
          onChange={(e) => updateFilter('hierarchy_id', e.target.value)}
          className="w-[130px]"
        />

        <div className="flex items-center gap-2 ml-auto">
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

      {/* Active Filters Display */}
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
          {filters.hierarchy_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hierarchy: {filters.hierarchy_id}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('hierarchy_id', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
