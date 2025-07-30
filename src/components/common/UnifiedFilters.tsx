import {Filter} from 'lucide-react';
import React, {useState} from 'react';

import {HierarchySelector} from '@/components/common/HierarchySelector';
import {DateRangeFilter} from '@/components/filters/DateRangeFilter';
import {FilterSection} from '@/components/filters/FilterSection';
import {MultiSelectFilter} from '@/components/filters/MultiSelectFilter';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {useAdminData} from '@/contexts/AdminDataContext';
import {countActiveFilters, useFilterLogic} from '@/hooks/useFilterLogic';
import {PURPOSE_STATUSES_DISPLAY, UnifiedFilters as UnifiedFiltersType} from '@/types/filters';
import {getStatusDisplayFromLabel} from '@/utils/statusUtils';


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
  const {hierarchies, suppliers, serviceTypes, materials, responsibleAuthorities, isLoading} = useAdminData();
  
  // Custom hook for filter logic
  const {
    toggleServiceType,
    toggleStatus,
    toggleSupplier,
    toggleMaterial,
    togglePendingAuthority,
    filteredMaterials
  } = useFilterLogic({ filters, onFiltersChange, materials });

  // Transform data for MultiSelectFilter components
  const serviceTypeOptions = serviceTypes.map(type => ({ id: type.id, name: type.name }));
  const supplierOptions = suppliers.map(supplier => ({ id: supplier.id, name: supplier.name }));
  const materialOptions = filteredMaterials.map(material => ({ id: material.id, name: material.name }));
  const pendingAuthorityOptions = responsibleAuthorities.map(authority => ({ id: authority.id, name: authority.name }));
  const statusOptions = PURPOSE_STATUSES_DISPLAY.map(status => {
    const statusInfo = getStatusDisplayFromLabel(status);
    return {
      id: status,
      name: status,
      variant: statusInfo.variant,
      className: statusInfo.className
    };
  });

  return (
    <div className="space-y-4">
      {/* Date Range Controls */}
      <DateRangeFilter filters={filters} onFiltersChange={onFiltersChange} />

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
          <FilterSection borderTop borderBottom>
            <MultiSelectFilter
              title="Service Types"
              options={serviceTypeOptions}
              selectedValues={filters.service_type || []}
              onToggle={toggleServiceType}
              isLoading={isLoading}
            />
          </FilterSection>

          {/* Material Multi-Select */}
          <FilterSection borderBottom>
            <MultiSelectFilter
              title="Materials"
              options={materialOptions}
              selectedValues={filters.material || []}
              onToggle={toggleMaterial}
              isLoading={isLoading}
              subtitle={filters.service_type && filters.service_type.length > 0 
                ? `(filtered by ${filters.service_type.length} service type${filters.service_type.length > 1 ? 's' : ''})`
                : undefined}
              emptyMessage={filters.service_type && filters.service_type.length > 0 
                ? 'No materials found for selected service types'
                : 'No materials available'}
            />
          </FilterSection>

          {/* Supplier Multi-Select */}
          <FilterSection borderBottom>
            <MultiSelectFilter
              title="Suppliers"
              options={supplierOptions}
              selectedValues={filters.supplier || []}
              onToggle={toggleSupplier}
              isLoading={isLoading}
            />
          </FilterSection>

          {/* Pending Authority Multi-Select */}
          <FilterSection borderBottom>
            <MultiSelectFilter
              title="Pending Authorities"
              options={pendingAuthorityOptions}
              selectedValues={filters.pending_authority || []}
              onToggle={togglePendingAuthority}
              isLoading={isLoading}
            />
          </FilterSection>

          {/* Status Multi-Select */}
          <FilterSection showBorder={false}>
            <MultiSelectFilter
              title="Statuses"
              options={statusOptions}
              selectedValues={filters.status || []}
              onToggle={toggleStatus}
              maxHeight=""
            />
          </FilterSection>
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