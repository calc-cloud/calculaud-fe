import {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

import {UnifiedFilters} from '@/types/filters';
import {SortConfig} from '@/utils/sorting';

interface UseUrlParamsProps {
  filters: UnifiedFilters;
  sortConfig: SortConfig;
  currentPage: number;
}

export const useUrlParams = ({filters, sortConfig, currentPage}: UseUrlParamsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse URL params to initial filters
  const getInitialFilters = (): UnifiedFilters => {
    const parsedFilters: UnifiedFilters = {};
    
    if (searchParams.get('search_query')) {
      parsedFilters.search_query = searchParams.get('search_query') || undefined;
    }
    
    // Parse service type IDs
    if (searchParams.get('service_type_id')) {
      const serviceTypeIds = searchParams.get('service_type_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        parsedFilters.service_type = serviceTypeIds;
      }
    }
    
    if (searchParams.get('status')) {
      parsedFilters.status = searchParams.get('status')?.split(',');
    }
    
    // Parse supplier IDs
    if (searchParams.get('supplier_id')) {
      const supplierIds = searchParams.get('supplier_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (supplierIds && supplierIds.length > 0) {
        parsedFilters.supplier = supplierIds;
      }
    }
    
    if (searchParams.get('hierarchy_id')) {
      const hierarchyIds = searchParams.get('hierarchy_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (hierarchyIds && hierarchyIds.length > 0) {
        parsedFilters.hierarchy_id = hierarchyIds;
      }
    }
    
    // Parse material IDs (service IDs)
    if (searchParams.get('material_id')) {
      const materialIds = searchParams.get('material_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (materialIds && materialIds.length > 0) {
        parsedFilters.material = materialIds;
      }
    }

    // Parse pending authority IDs
    if (searchParams.get('pending_authority_id')) {
      const pendingAuthorityIds = searchParams.get('pending_authority_id')?.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (pendingAuthorityIds && pendingAuthorityIds.length > 0) {
        parsedFilters.pending_authority = pendingAuthorityIds;
      }
    }
    
    if (searchParams.get('start_date')) {
      parsedFilters.start_date = searchParams.get('start_date') || undefined;
    }
    if (searchParams.get('end_date')) {
      parsedFilters.end_date = searchParams.get('end_date') || undefined;
    }
    if (searchParams.get('relative_time')) {
      parsedFilters.relative_time = searchParams.get('relative_time') || undefined;
    }

    // If no date/time filters are provided in URL, set default "All Time" values
    const hasDateTimeParams = searchParams.get('start_date') || searchParams.get('end_date') || searchParams.get('relative_time');
    if (!hasDateTimeParams) {
      // For "All Time", don't set start_date or end_date
      parsedFilters.relative_time = 'all_time';
    }

    return parsedFilters;
  };

  // Parse URL params to initial sort config
  const getInitialSortConfig = (): SortConfig => {
    const sortField = searchParams.get('sort_field') as any;
    const sortDirection = searchParams.get('sort_direction') as any;
    
    return {
      field: sortField || 'creation_time',
      direction: sortDirection || 'desc'
    };
  };

  // Parse URL params to initial page
  const getInitialPage = (): number => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  };

  // Update URL when filters, sorting, or pagination changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add search query
    if (filters.search_query) {
      params.set('search_query', filters.search_query);
    }

    // Add service type IDs
    if (filters.service_type && filters.service_type.length > 0) {
      params.set('service_type_id', filters.service_type.join(','));
    }

    // Add statuses
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }

    // Add supplier IDs
    if (filters.supplier && filters.supplier.length > 0) {
      params.set('supplier_id', filters.supplier.join(','));
    }

    // Add hierarchy IDs
    if (filters.hierarchy_id && filters.hierarchy_id.length > 0) {
      params.set('hierarchy_id', filters.hierarchy_id.join(','));
    }

    // Add material IDs
    if (filters.material && filters.material.length > 0) {
      params.set('material_id', filters.material.join(','));
    }

    // Add pending authority IDs
    if (filters.pending_authority && filters.pending_authority.length > 0) {
      params.set('pending_authority_id', filters.pending_authority.join(','));
    }

    // Add date/time filters (always include these if they have values, including defaults)
    if (filters.start_date) {
      params.set('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.set('end_date', filters.end_date);
    }
    if (filters.relative_time) {
      params.set('relative_time', filters.relative_time);
    }

    // Add sorting
    if (sortConfig.field !== 'creation_time' || sortConfig.direction !== 'desc') {
      params.set('sort_field', sortConfig.field);
      params.set('sort_direction', sortConfig.direction);
    }

    // Add pagination
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    setSearchParams(params, { replace: true });

    // Update stored search URL to match current filters
    const currentUrl = `${window.location.origin}${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    sessionStorage.setItem('searchUrl', currentUrl);
  }, [filters, sortConfig, currentPage, setSearchParams]);

  return {
    getInitialFilters,
    getInitialSortConfig,
    getInitialPage
  };
};