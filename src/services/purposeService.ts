
import { apiService } from '@/services/apiService';
import { PurposeFilters } from '@/types';

export interface PurposeApiParams {
  page?: number;
  size?: number;
  hierarchy_id?: number;
  supplier_id?: number;
  service_type_id?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PurposeApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Purpose {
  id: number;
  hierarchy_id: number;
  expected_delivery: string;
  comments?: string;
  status: string;
  supplier: string;
  content: string;
  description: string;
  service_type: string;
  creation_time: string;
  last_modified: string;
  emfs: EMF[];
}

export interface EMF {
  id: number;
  emf_id: string;
  purpose_id: number;
  creation_time: string;
  order_id?: string;
  order_creation_date?: string;
  demand_id?: string;
  demand_creation_date?: string;
  bikushit_id?: string;
  bikushit_creation_date?: string;
  costs: EMFCost[];
}

export interface EMFCost {
  id: number;
  emf_id: number;
  currency: string;
  amount: number;
}

class PurposeService {
  async getPurposes(params: PurposeApiParams): Promise<PurposeApiResponse> {
    console.log('Fetching purposes with params:', params);
    return apiService.get<PurposeApiResponse>('/purposes/', params);
  }

  // Map frontend filters to API parameters
  mapFiltersToApiParams(
    filters: PurposeFilters, 
    sortConfig: { field: string; direction: string },
    currentPage: number,
    itemsPerPage: number,
    hierarchies: any[],
    suppliers: any[],
    serviceTypes: any[]
  ): PurposeApiParams {
    const params: PurposeApiParams = {
      page: currentPage,
      size: itemsPerPage,
      sort_by: this.mapSortField(sortConfig.field),
      sort_order: sortConfig.direction as 'asc' | 'desc'
    };

    // Search query
    if (filters.search_query) {
      params.search = filters.search_query;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      // For now, take the first status since API doesn't support multiple
      params.status = this.mapStatusToApi(filters.status[0]);
    }

    // Hierarchy filter
    if (filters.hierarchy_id) {
      const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
      if (hierarchyIds.length > 0) {
        // For now, take the first hierarchy since API doesn't support multiple
        const hierarchy = hierarchies.find(h => h.id === hierarchyIds[0]);
        if (hierarchy) {
          params.hierarchy_id = parseInt(hierarchy.id);
        }
      }
    }

    // Supplier filter
    if (filters.supplier && filters.supplier.length > 0) {
      // For now, take the first supplier since API doesn't support multiple
      const supplier = suppliers.find(s => s.name === filters.supplier![0]);
      if (supplier) {
        params.supplier_id = supplier.id;
      }
    }

    // Service type filter
    if (filters.service_type && filters.service_type.length > 0) {
      // For now, take the first service type since API doesn't support multiple
      const serviceType = serviceTypes.find(st => st.name === filters.service_type![0]);
      if (serviceType) {
        params.service_type_id = serviceType.id;
      }
    }

    return params;
  }

  private mapSortField(field: string): string {
    switch (field) {
      case 'creation_time':
        return 'creation_time';
      case 'expected_delivery':
        return 'expected_delivery';
      case 'last_modified':
        return 'last_modified';
      default:
        return 'creation_time';
    }
  }

  private mapStatusToApi(status: string): string {
    switch (status) {
      case 'Pending':
        return 'PENDING';
      case 'In Progress':
        return 'IN_PROGRESS';
      case 'Completed':
        return 'COMPLETED';
      case 'Rejected':
        return 'CANCELLED';
      default:
        return status;
    }
  }

  // Transform API response to match frontend data structure
  transformApiResponse(apiData: PurposeApiResponse, hierarchies: any[]): {
    purposes: any[];
    total: number;
    page: number;
    pages: number;
  } {
    const transformedPurposes = apiData.items.map(purpose => ({
      id: purpose.id.toString(),
      description: purpose.description,
      content: purpose.content,
      supplier: purpose.supplier,
      hierarchy_id: purpose.hierarchy_id.toString(),
      hierarchy_name: this.getHierarchyName(purpose.hierarchy_id, hierarchies),
      status: this.mapApiStatusToFrontend(purpose.status),
      expected_delivery: purpose.expected_delivery,
      comments: purpose.comments || '',
      service_type: purpose.service_type,
      creation_time: purpose.creation_time,
      last_modified: purpose.last_modified,
      emfs: purpose.emfs.map(emf => ({
        id: emf.emf_id,
        purpose_id: purpose.id.toString(),
        creation_date: emf.creation_time,
        demand_id: emf.demand_id || undefined,
        demand_creation_date: emf.demand_creation_date || undefined,
        order_id: emf.order_id || undefined,
        order_creation_date: emf.order_creation_date || undefined,
        bikushit_id: emf.bikushit_id || undefined,
        bikushit_creation_date: emf.bikushit_creation_date || undefined,
        costs: emf.costs.map(cost => ({
          id: cost.id.toString(),
          emf_id: emf.emf_id,
          amount: cost.amount,
          currency: this.mapApiCurrencyToFrontend(cost.currency)
        }))
      })),
      files: [] // API doesn't return files yet
    }));

    return {
      purposes: transformedPurposes,
      total: apiData.total,
      page: apiData.page,
      pages: apiData.pages
    };
  }

  private getHierarchyName(hierarchyId: number, hierarchies: any[]): string {
    const hierarchy = hierarchies.find(h => parseInt(h.id) === hierarchyId);
    return hierarchy ? hierarchy.name : `Hierarchy ${hierarchyId}`;
  }

  private mapApiStatusToFrontend(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'PENDING';
      case 'IN_PROGRESS':
        return 'IN_PROGRESS';
      case 'COMPLETED':
        return 'COMPLETED';
      case 'CANCELLED':
        return 'PENDING'; // Map CANCELLED to PENDING for now
      default:
        return status;
    }
  }

  private mapApiCurrencyToFrontend(currency: string): string {
    switch (currency) {
      case 'ILS':
        return 'ILS';
      case 'SUPPORT_USD':
        return 'SUPPORT_USD';
      case 'AVAILABLE_USD':
        return 'AVAILABLE_USD';
      default:
        return currency;
    }
  }
}

export const purposeService = new PurposeService();
