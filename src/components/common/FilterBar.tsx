
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  const getMaterialLabel = () => {
    const selectedMaterials = filters.material || [];
    if (selectedMaterials.length === 0) return 'Materials';
    if (selectedMaterials.length === 1) return selectedMaterials[0];
    return `${selectedMaterials.length} selected`;
  };

  const PURPOSE_STATUSES = ['In Progress', 'Completed'];

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
