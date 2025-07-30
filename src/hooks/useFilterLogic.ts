import React from 'react';

import {UnifiedFilters} from '@/types/filters';
import {createToggleFunction} from '@/utils/filterUtils';

// Helper function to count active filters
export const countActiveFilters = (filters: UnifiedFilters) => {
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
    // Count each individual pending authority selection
    ...(filters.pending_authority || []),
  ].length;
};

interface UseFilterLogicProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
  materials: any[];
}

export const useFilterLogic = ({
  filters,
  onFiltersChange,
  materials
}: UseFilterLogicProps) => {
  // Create toggle functions using the generic helper
  const toggleServiceType = createToggleFunction<number>('service_type', filters, onFiltersChange);
  const toggleStatus = createToggleFunction<string>('status', filters, onFiltersChange);
  const toggleSupplier = createToggleFunction<number>('supplier', filters, onFiltersChange);
  const toggleMaterial = createToggleFunction<number>('material', filters, onFiltersChange);
  const togglePendingAuthority = createToggleFunction<number>('pending_authority', filters, onFiltersChange);

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

  // Function to reset relative time filter to default
  const clearRelativeTime = () => {
    onFiltersChange({
      ...filters,
      relative_time: 'all_time',
      start_date: undefined,
      end_date: undefined
    });
  };

  return {
    toggleServiceType,
    toggleStatus,
    toggleSupplier,
    toggleMaterial,
    togglePendingAuthority,
    filteredMaterials,
    clearRelativeTime,
  };
};