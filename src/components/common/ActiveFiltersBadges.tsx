import React from 'react';
import {X} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {RELATIVE_TIME_OPTIONS, UnifiedFilters as UnifiedFiltersType} from '@/types/filters';
import {Hierarchy} from '@/types/hierarchies';
import {ServiceType} from '@/types/serviceTypes';
import {Supplier} from '@/types/suppliers';
import {Material} from '@/types/materials';
import {createToggleFunction} from '@/utils/filterUtils';

interface ActiveFiltersBadgesProps {
  filters: UnifiedFiltersType;
  onFiltersChange: (filters: UnifiedFiltersType) => void;
  hierarchies: Hierarchy[];
  serviceTypes: ServiceType[];
  suppliers: Supplier[];
  materials: Material[];
}

export const ActiveFiltersBadges: React.FC<ActiveFiltersBadgesProps> = ({
  filters,
  onFiltersChange,
  hierarchies,
  serviceTypes,
  suppliers,
  materials,
}) => {
  const toggleServiceType = createToggleFunction<number>('service_type', filters, onFiltersChange);
  const toggleStatus = createToggleFunction<string>('status', filters, onFiltersChange);
  const toggleSupplier = createToggleFunction<number>('supplier', filters, onFiltersChange);
  const toggleMaterial = createToggleFunction<number>('material', filters, onFiltersChange);
  const toggleHierarchy = createToggleFunction<number>('hierarchy_id', filters, onFiltersChange);

  const clearRelativeTime = () => {
    onFiltersChange({
      ...filters,
      relative_time: 'all_time',
      start_date: undefined,
      end_date: undefined,
    });
  };

  const activeFiltersCount = [
    ...(filters.relative_time && filters.relative_time !== 'all_time' ? [1] : []),
    ...(filters.hierarchy_id || []),
    ...(filters.service_type || []),
    ...(filters.status || []),
    ...(filters.supplier || []),
    ...(filters.material || []),
  ].length;

  if (activeFiltersCount === 0) return null;

  return (
    <div className="space-y-2 pb-2">
      <div className="flex flex-wrap gap-2">
        {filters.relative_time && filters.relative_time !== 'all_time' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {RELATIVE_TIME_OPTIONS.find(option => option.value === filters.relative_time)?.label || filters.relative_time}
            <X className="h-3 w-3 cursor-pointer" onClick={clearRelativeTime} />
          </Badge>
        )}
        {filters.hierarchy_id && filters.hierarchy_id.length > 0 && (
          <>{filters.hierarchy_id.map((hierarchyId) => {
            const hierarchy = hierarchies.find(h => h.id === hierarchyId);
            return hierarchy ? (
              <Badge key={hierarchyId} variant="secondary" className="flex items-center gap-1">
                {hierarchy.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleHierarchy(hierarchyId)} />
              </Badge>
            ) : null;
          })}</>
        )}
        {filters.service_type && filters.service_type.length > 0 && (
          <>{filters.service_type.map((typeId) => {
            const type = serviceTypes.find(st => st.id === typeId);
            return type ? (
              <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                {type.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleServiceType(typeId)} />
              </Badge>
            ) : null;
          })}</>
        )}
        {filters.status && filters.status.length > 0 && (
          <>{filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              {status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatus(status)} />
            </Badge>
          ))}</>
        )}
        {filters.supplier && filters.supplier.length > 0 && (
          <>{filters.supplier.map((supplierId) => {
            const supplier = suppliers.find(s => s.id === supplierId);
            return supplier ? (
              <Badge key={supplierId} variant="secondary" className="flex items-center gap-1">
                {supplier.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSupplier(supplierId)} />
              </Badge>
            ) : null;
          })}</>
        )}
        {filters.material && filters.material.length > 0 && (
          <>{filters.material.map((materialId) => {
            const material = materials.find(m => m.id === materialId);
            return material ? (
              <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                {material.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleMaterial(materialId)} />
              </Badge>
            ) : null;
          })}</>
        )}
      </div>
    </div>
  );
}; 