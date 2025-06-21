
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, X, ChevronDown } from 'lucide-react';
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
  const { hierarchies, suppliers, serviceTypes } = useAdminData();

  const updateFilter = (key: keyof PurposeFilters, value: string | string[] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
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

  const PURPOSE_STATUSES = ['Pending', 'In Progress', 'Rejected', 'Completed'];

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
        {/* Hierarchy Selector */}
        <HierarchySelector
          hierarchies={hierarchies}
          selectedIds={filters.hierarchy_id ? [filters.hierarchy_id] : []}
          onSelectionChange={(selectedIds) => 
            updateFilter('hierarchy_id', selectedIds.length > 0 ? selectedIds[0] : undefined)
          }
        />

        {/* Service Type Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-between">
              {getServiceTypeLabel()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] p-2 bg-white border shadow-md z-50">
            {serviceTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={(filters.service_type || []).includes(type.name as any)}
                  onCheckedChange={() => toggleServiceType(type.name)}
                />
                <span>{type.name}</span>
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
                  checked={(filters.status || []).includes(status as any)}
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
            {suppliers.map((supplier) => (
              <DropdownMenuItem
                key={supplier.id}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Checkbox
                  checked={(filters.supplier || []).includes(supplier.name as any)}
                  onCheckedChange={() => toggleSupplier(supplier.name)}
                />
                <span className="truncate">{supplier.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
              Unit: {hierarchies.find(h => h.id === filters.hierarchy_id)?.name || filters.hierarchy_id}
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
