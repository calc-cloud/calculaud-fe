import { apiService } from '@/services/apiService';
import { PurposeFilters, PurposeContent } from '@/types';

export interface PurposeApiParams {
  page?: number;
  limit?: number; // Changed from size to limit
  hierarchy_id?: number | number[];
  supplier_id?: number | number[];
  service_type_id?: number | number[];
  status?: string | string[];
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PurposeApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  limit: number; // Changed from size to limit
  pages: number;
}

export interface Purpose {
  id: number;
  hierarchy?: {
    type: string;
    name: string;
    parent_id: number | null;
    id: number;
    path: string;
  };
  expected_delivery: string;
  comments?: string;
  status: string;
  supplier: string;
  contents: APIContent[]; // Changed from content to contents
  description: string;
  service_type: string;
  creation_time: string;
  last_modified: string;
  emfs: EMF[];
}

export interface APIContent {
  id?: number;
  service_id: number;
  service_name?: string;
  service_type?: string;
  quantity: number;
}

export interface EMF {
  id: number;
  emf_id: string;
  purpose_id: number;
  creation_date: string; // Changed from creation_time
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

// Request interfaces for create/update
export interface CreatePurposeRequest {
  hierarchy_id?: number;
  expected_delivery?: string;
  comments?: string;
  status: string;
  supplier_id: number;
  contents: CreateContentRequest[]; // Changed from content to contents
  description: string;
  service_type_id: number;
  emfs?: CreateEMFRequest[];
}

export interface CreateContentRequest {
  service_id: number;
  quantity: number;
}

export interface CreateEMFRequest {
  emf_id: string;
  creation_date?: string; // Changed from creation_time to creation_date
  order_id?: string;
  order_creation_date?: string;
  demand_id?: string;
  demand_creation_date?: string;
  bikushit_id?: string;
  bikushit_creation_date?: string;
  costs: CreateCostRequest[];
}

export interface CreateCostRequest {
  currency: string;
  amount: number;
}

export interface UpdatePurposeRequest {
  hierarchy_id?: number;
  expected_delivery?: string;
  comments?: string;
  status?: string;
  supplier_id?: number;
  contents?: CreateContentRequest[]; // Changed from content to contents
  description?: string;
  service_type_id?: number;
  emfs?: CreateEMFRequest[];
}

class PurposeService {
  async getPurposes(params: PurposeApiParams): Promise<PurposeApiResponse> {
    return apiService.get<PurposeApiResponse>('/purposes/', params);
  }

  async createPurpose(data: CreatePurposeRequest): Promise<Purpose> {
    return apiService.post<Purpose>('/purposes/', data);
  }

  async updatePurpose(id: string, data: UpdatePurposeRequest): Promise<Purpose> {
    return apiService.patch<Purpose>(`/purposes/${id}`, data);
  }

  async deletePurpose(id: string): Promise<void> {
    return apiService.delete<void>(`/purposes/${id}`);
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
      limit: itemsPerPage, // Changed from size to limit
      sort_by: this.mapSortField(sortConfig.field),
      sort_order: sortConfig.direction as 'asc' | 'desc'
    };

    // Search query
    if (filters.search_query) {
      params.search = filters.search_query;
    }

    // Status filter - handle multiple statuses
    if (filters.status && filters.status.length > 0) {
      params.status = filters.status.map(status => this.mapStatusToApi(status));
    }

    // Hierarchy filter - handle multiple hierarchies
    if (filters.hierarchy_id) {
      const hierarchyIds = Array.isArray(filters.hierarchy_id) ? filters.hierarchy_id : [filters.hierarchy_id];
      if (hierarchyIds.length > 0) {
        const validHierarchyIds = hierarchyIds
          .map(id => {
            // Convert string id to number for comparison
            const numericId = typeof id === 'string' ? parseInt(id) : id;
            const hierarchy = hierarchies.find(h => h.id === numericId);
            return hierarchy ? numericId : null;
          })
          .filter(id => id !== null) as number[];
        
        if (validHierarchyIds.length > 0) {
          params.hierarchy_id = validHierarchyIds.length === 1 ? validHierarchyIds[0] : validHierarchyIds;
        }
      }
    }

    // Supplier filter - handle multiple suppliers
    if (filters.supplier && filters.supplier.length > 0) {
      const validSupplierIds = filters.supplier
        .map(supplierName => {
          const supplier = suppliers.find(s => s.name === supplierName);
          return supplier ? parseInt(supplier.id) : null;
        })
        .filter(id => id !== null) as number[];
      
      if (validSupplierIds.length > 0) {
        params.supplier_id = validSupplierIds.length === 1 ? validSupplierIds[0] : validSupplierIds;
      }
    }

    // Service type filter - handle multiple service types
    if (filters.service_type && filters.service_type.length > 0) {
      const validServiceTypeIds = filters.service_type
        .map(serviceTypeName => {
          const serviceType = serviceTypes.find(st => st.name === serviceTypeName);
          return serviceType ? parseInt(serviceType.id) : null;
        })
        .filter(id => id !== null) as number[];
      
      if (validServiceTypeIds.length > 0) {
        params.service_type_id = validServiceTypeIds.length === 1 ? validServiceTypeIds[0] : validServiceTypeIds;
      }
    }

    return params;
  }

  // Helper method to filter out invalid contents
  private filterValidContents(contents: any[]): any[] {
    if (!contents || !Array.isArray(contents)) {
      return [];
    }
    
    return contents.filter(content => 
      content.service_id && 
      content.service_id > 0 && 
      content.quantity && 
      content.quantity > 0
    );
  }

  // Simplified mapping - IDs are already provided from the modal
  mapPurposeToCreateRequest(purposeData: any): CreatePurposeRequest {
    const mapped: CreatePurposeRequest = {
      description: purposeData.description,
      contents: this.filterValidContents(purposeData.contents || []), // Filter out invalid contents
      supplier_id: purposeData.supplier_id,
      service_type_id: purposeData.service_type_id,
      status: purposeData.status || 'IN_PROGRESS' // Fixed: changed from 'PENDING' to 'IN_PROGRESS'
    };

    // Optional fields
    if (purposeData.hierarchy_id) {
      mapped.hierarchy_id = parseInt(purposeData.hierarchy_id);
    }
    
    if (purposeData.expected_delivery) {
      mapped.expected_delivery = purposeData.expected_delivery;
    }
    
    if (purposeData.comments?.trim()) {
      mapped.comments = purposeData.comments.trim();
    }

    // Map EMFs if provided - Fixed field mapping to use creation_date
    if (purposeData.emfs && purposeData.emfs.length > 0) {
      mapped.emfs = purposeData.emfs.map((emf: any) => ({
        emf_id: emf.id,
        creation_date: emf.creation_date || undefined, // Use creation_date field
        order_id: emf.order_id || undefined,
        order_creation_date: emf.order_creation_date || undefined,
        demand_id: emf.demand_id || undefined,
        demand_creation_date: emf.demand_creation_date || undefined,
        bikushit_id: emf.bikushit_id || undefined,
        bikushit_creation_date: emf.bikushit_creation_date || undefined,
        costs: emf.costs.map((cost: any) => ({
          currency: cost.currency,
          amount: cost.amount
        }))
      }));
    }

    return mapped;
  }

  // Simplified update request mapping
  mapPurposeToUpdateRequest(purposeData: any): UpdatePurposeRequest {
    const mapped: UpdatePurposeRequest = {};

    if (purposeData.description !== undefined) {
      mapped.description = purposeData.description;
    }
    if (purposeData.contents !== undefined) { // Changed from content to contents
      mapped.contents = this.filterValidContents(purposeData.contents); // Filter out invalid contents
    }
    if (purposeData.supplier_id !== undefined) {
      mapped.supplier_id = purposeData.supplier_id;
    }
    if (purposeData.service_type_id !== undefined) {
      mapped.service_type_id = purposeData.service_type_id;
    }
    if (purposeData.expected_delivery !== undefined) {
      mapped.expected_delivery = purposeData.expected_delivery;
    }
    if (purposeData.comments !== undefined) {
      mapped.comments = purposeData.comments;
    }
    if (purposeData.status !== undefined) {
      mapped.status = purposeData.status;
    }
    if (purposeData.hierarchy_id !== undefined) {
      mapped.hierarchy_id = parseInt(purposeData.hierarchy_id);
    }

    // Map EMFs - Fixed field mapping to use creation_date
    if (purposeData.emfs !== undefined) {
      mapped.emfs = purposeData.emfs.map((emf: any) => ({
        emf_id: emf.id,
        creation_date: emf.creation_date || undefined, // Use creation_date field
        order_id: emf.order_id || undefined,
        order_creation_date: emf.order_creation_date || undefined,
        demand_id: emf.demand_id || undefined,
        demand_creation_date: emf.demand_creation_date || undefined,
        bikushit_id: emf.bikushit_id || undefined,
        bikushit_creation_date: emf.bikushit_creation_date || undefined,
        costs: emf.costs.map((cost: any) => ({
          currency: cost.currency,
          amount: cost.amount
        }))
      }));
    }

    return mapped;
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
      case 'In Progress':
        return 'IN_PROGRESS';
      case 'Completed':
        return 'COMPLETED';
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
      contents: purpose.contents || [], // Changed from content to contents
      supplier: purpose.supplier,
      hierarchy_id: purpose.hierarchy ? purpose.hierarchy.id.toString() : '',
      hierarchy_name: purpose.hierarchy ? purpose.hierarchy.path : '',
      status: this.mapApiStatusToFrontend(purpose.status),
      expected_delivery: purpose.expected_delivery,
      comments: purpose.comments || '',
      service_type: purpose.service_type,
      creation_time: purpose.creation_time,
      last_modified: purpose.last_modified,
      emfs: purpose.emfs.map(emf => ({
        id: emf.emf_id,
        purpose_id: purpose.id.toString(),
        creation_date: emf.creation_date, // Use creation_date from API
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

  private getHierarchyName(hierarchyId: number | null, hierarchies: any[]): string {
    if (!hierarchyId) return '';
    const hierarchy = hierarchies.find(h => parseInt(h.id) === hierarchyId);
    return hierarchy ? hierarchy.name : `Hierarchy ${hierarchyId}`;
  }

  private mapApiStatusToFrontend(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'IN_PROGRESS';
      case 'COMPLETED':
        return 'COMPLETED';
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
