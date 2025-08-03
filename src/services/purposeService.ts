import {apiService} from '@/services/apiService';
import {CreatePurchaseRequest as PurchaseCreateRequest, Currency} from '@/types';
import {UnifiedFilters} from '@/types/filters';

export interface PurposeApiParams {
  page?: number;
  limit?: number; // Changed from size to limit
  hierarchy_id?: number | number[];
  supplier_id?: number | number[];
  service_type_id?: number | number[];
  service_id?: number | number[]; // Material filter (maps to service_id in API)
  pending_authority_id?: number | number[];
  status?: string | string[];
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

export interface PurposeApiResponse {
  items: Purpose[];
  total: number;
  page: number;
  limit: number; // Changed from size to limit
  pages: number;
}

export interface APIContent {
  service_id: number;
  service_name: string;
  service_type: string;
  quantity: number;
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
  purchases: Purchase[]; // Changed from emfs: EMF[] to purchases: Purchase[]
  file_attachments: {
    id: number;
    original_filename: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    uploaded_at: string;
    file_url: string;
  }[];
  pending_authority?: {
    id: number;
    name: string;
    description: string;
    created_at: string;
  };
}

export interface Purchase {
  id: number;
  purpose_id: number;
  creation_date: string;
  costs: Cost[];
  flow_stages: Stage[];
  current_pending_stages?: Stage[];
  days_since_last_completion?: number;
}

export interface Stage {
  id: number;
  purchase_id: number;
  stage_type_id: number;
  priority: number;
  value: string | null;
  completion_date: string | null;
  days_since_previous_stage: number | null;
  stage_type: StageType;
}

export interface StageType {
  id: number;
  name: string;
  display_name?: string;
  value_required: boolean;
}

export interface Cost {
  id: number;
  purchase_id: number; // Changed from emf_id to purchase_id
  currency: Currency;
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
  purchases?: CreatePurchaseRequest[]; // Changed from emfs?: CreateEMFRequest[] to purchases?: CreatePurchaseRequest[]
}

export interface CreateContentRequest {
  service_id: number;
  quantity: number;
}

export interface CreatePurchaseRequest {
  creation_date?: string;
  costs: CreateCostRequest[];
  flow_stages?: CreateStageRequest[];
}

export interface CreateStageRequest {
  stage_type_id: number;
  priority: number;
  value?: string;
  completion_date?: string;
}

export interface CreateCostRequest {
  currency: Currency;
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
  purchases?: CreatePurchaseRequest[]; // Changed from emfs?: CreateEMFRequest[] to purchases?: CreatePurchaseRequest[]
}

class PurposeService {
  async getPurposes(params: PurposeApiParams): Promise<PurposeApiResponse> {
    return apiService.get<PurposeApiResponse>('/purposes/', params);
  }

  async getPurpose(id: string): Promise<Purpose> {
    return apiService.get<Purpose>(`/purposes/${id}`);
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

  async createPurchase(data: PurchaseCreateRequest): Promise<Purchase> {
    return apiService.post<Purchase>('/purchases/', data);
  }

  async deletePurchase(purchaseId: string): Promise<void> {
    return apiService.delete<void>(`/purchases/${purchaseId}`);
  }

  async exportPurposesCSV(params: Omit<PurposeApiParams, 'page' | 'limit'>): Promise<Response> {
    return apiService.downloadBlob('/purposes/export_csv', params);
  }

  async uploadFile(purposeId: string, file: File): Promise<{
    id: number;
    original_filename: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    uploaded_at: string;
    file_url: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.uploadFile(`/purposes/${purposeId}/files`, formData);
  }

  async deleteFile(purposeId: string, fileId: string): Promise<void> {
    return apiService.delete<void>(`/purposes/${purposeId}/files/${fileId}`);
  }



  // Map frontend filters to API parameters
  mapFiltersToApiParams(
    filters: UnifiedFilters, 
    sortConfig: { field: string; direction: string },
    currentPage: number,
    itemsPerPage: number
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
    if (filters.hierarchy_id && filters.hierarchy_id.length > 0) {
      params.hierarchy_id = filters.hierarchy_id.length === 1 ? filters.hierarchy_id[0] : filters.hierarchy_id;
    }

    // Supplier filter - handle multiple suppliers
    if (filters.supplier && filters.supplier.length > 0) {
      params.supplier_id = filters.supplier.length === 1 ? filters.supplier[0] : filters.supplier;
    }

    // Service type filter - handle multiple service types
    if (filters.service_type && filters.service_type.length > 0) {
      params.service_type_id = filters.service_type.length === 1 ? filters.service_type[0] : filters.service_type;
    }

    // Material filter - handle multiple materials (maps to service_id in API)
    if (filters.material && filters.material.length > 0) {
      params.service_id = filters.material.length === 1 ? filters.material[0] : filters.material;
    }

    // Pending authority filter - handle multiple pending authorities
    if (filters.pending_authority && filters.pending_authority.length > 0) {
      params.pending_authority_id = filters.pending_authority.length === 1 ? filters.pending_authority[0] : filters.pending_authority;
    }

    // Date filters
    if (filters.start_date) {
      params.start_date = filters.start_date;
    }
    if (filters.end_date) {
      // Backend is now inclusive, so pass end_date as-is
      params.end_date = filters.end_date;
    }

    return params;
  }

  // Helper method to filter out invalid contents
  private filterValidContents(contents: any[]): any[] {
    if (!contents || !Array.isArray(contents)) {
      return [];
    }
    
    return contents.filter(content => {
      // Check for both material_id (frontend) and service_id (backend) for compatibility
      const serviceId = content.service_id || content.material_id;
      return serviceId && 
             serviceId > 0 && 
             content.quantity && 
             content.quantity > 0;
    }).map(content => {
      // Ensure the content has the correct field mapping for the API
      // If material_id is different from service_id, use material_id as the new service_id
      const finalServiceId = content.material_id && content.material_id !== content.service_id 
        ? content.material_id 
        : content.service_id || content.material_id;
      
      return {
        service_id: finalServiceId,
        quantity: content.quantity
      };
    });
  }

  // Helper method to map purchases (eliminates duplication)
  private mapPurchases(purchases: any[]): CreatePurchaseRequest[] {
    return purchases.map((purchase: any) => ({
      creation_date: purchase.creation_date || undefined,
      costs: purchase.costs.map((cost: any) => ({
        currency: cost.currency,
        amount: cost.amount
      })),
      flow_stages: purchase.flow_stages.map((stage: any) => ({
        stage_type_id: stage.stage_type_id,
        priority: stage.priority,
        value: stage.value,
        completion_date: stage.completion_date
      }))
    }));
  }

  // Simplified mapping - IDs are already provided from the modal
  mapPurposeToCreateRequest(purposeData: any): CreatePurposeRequest {
    const mapped: CreatePurposeRequest = {
      description: purposeData.description,
      contents: this.filterValidContents(purposeData.contents || []),
      supplier_id: purposeData.supplier_id,
      service_type_id: purposeData.service_type_id,
      status: purposeData.status || 'IN_PROGRESS'
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

    // Map purchases if provided
    if (purposeData.purchases && purposeData.purchases.length > 0) {
      mapped.purchases = this.mapPurchases(purposeData.purchases);
    }

    return mapped;
  }

  // Simplified update request mapping
  mapPurposeToUpdateRequest(purposeData: any): UpdatePurposeRequest {
    const mapped: UpdatePurposeRequest = {};

    if (purposeData.description !== undefined) {
      mapped.description = purposeData.description;
    }
    if (purposeData.contents !== undefined) {
      mapped.contents = this.filterValidContents(purposeData.contents);
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

    // Map purchases using consolidated helper
    if (purposeData.purchases !== undefined) {
      mapped.purchases = this.mapPurchases(purposeData.purchases);
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
      case 'Signed':
        return 'SIGNED';
      case 'Partially Supplied':
        return 'PARTIALLY_SUPPLIED';
      default:
        return status;
    }
  }

  // Transform single purpose from API format to frontend format
  private transformSinglePurpose(purpose: Purpose, hierarchies: any[] = []): any {
    try {
      return {
        id: purpose.id?.toString() || '',
        description: purpose.description || '',
        contents: (purpose.contents || []).map(content => ({
          material_id: content.service_id,
          material_name: content.service_name,
          material_type: content.service_type,
          quantity: content.quantity,
          // Keep API fields for compatibility
          service_id: content.service_id,
          service_name: content.service_name,
          service_type: content.service_type
        })),
        supplier: purpose.supplier || '',
        hierarchy_id: purpose.hierarchy?.id?.toString() || '',
        hierarchy_name: purpose.hierarchy?.path || this.getHierarchyName(purpose.hierarchy?.id || null, hierarchies),
        status: this.mapApiStatusToFrontend(purpose.status || ''),
        expected_delivery: purpose.expected_delivery || '',
        comments: purpose.comments || '',
        service_type: purpose.service_type || '',
        creation_time: purpose.creation_time || '',
        last_modified: purpose.last_modified || '',
        pending_authority: purpose.pending_authority || null,
        purchases: (purpose.purchases || []).map(purchase => this.transformPurchase(purchase, purpose.id)),
        files: (purpose.file_attachments || []).map(file => this.transformFileAttachment(file, purpose.id))
      };
    } catch (_error) {
      // Return fallback object for malformed purpose data
      return {
        id: purpose.id?.toString() || '',
        description: 'Error loading purpose',
        contents: [],
        supplier: '',
        hierarchy_id: '',
        hierarchy_name: '',
        status: '',
        expected_delivery: '',
        comments: '',
        service_type: '',
        creation_time: '',
        last_modified: '',
        pending_authority: null,
        purchases: [],
        files: []
      };
    }
  }

  // Transform purchase object
  private transformPurchase(purchase: any, purposeId: number): any {
    return {
      id: purchase.id?.toString() || '',
      purpose_id: purposeId?.toString() || '',
      creation_date: purchase.creation_date || '',
      costs: (purchase.costs || []).map(cost => ({
        id: cost.id?.toString() || '',
        purchase_id: cost.purchase_id?.toString() || '',
        amount: cost.amount || 0,
        currency: this.mapApiCurrencyToFrontend(cost.currency || ''),
      })),
      flow_stages: (purchase.flow_stages || [])
        .flatMap((item: any) => Array.isArray(item) ? item : [item])
        .map((stage: any) => this.transformStage(stage, purchase.id)),
      current_pending_stages: (purchase.current_pending_stages || [])
        .map((stage: any) => this.transformStage(stage, purchase.id)),
      days_since_last_completion: purchase.days_since_last_completion ?? null,
      files: []
    };
  }

  // Transform stage object
  private transformStage(stage: any, purchaseId: number): any {
    return {
      id: stage.id?.toString() || '',
      purchase_id: purchaseId?.toString() || '',
      stage_type_id: stage.stage_type_id || 0,
      priority: stage.priority || 0,
      value: stage.value || null,
      completion_date: stage.completion_date || null,
      days_since_previous_stage: stage.days_since_previous_stage ?? null,
      stage_type: stage.stage_type || { id: '', name: '', value_required: false }
    };
  }

  // Transform file attachment object
  private transformFileAttachment(file: any, purposeId: number): any {
    return {
      id: file.id?.toString() || '',
      purpose_id: purposeId?.toString() || '',
      filename: file.original_filename || '',
      file_url: file.file_url || '',
      upload_date: file.uploaded_at || '',
      file_size: file.file_size || 0
    };
  }

  // Public method for transforming single purpose (for backward compatibility)
  transformApiPurpose(apiPurpose: Purpose, hierarchies: any[] = []): any {
    return this.transformSinglePurpose(apiPurpose, hierarchies);
  }

  transformApiResponse(apiData: any): {
    purposes: any[];
    total: number;
    page: number;
    pages: number;
  } {
    // Handle case where apiData is null/undefined
    if (!apiData) {
      return { purposes: [], total: 0, page: 1, pages: 1 };
    }

    // Handle different possible response formats
    const items = apiData.items || apiData.data || [];
    const total = apiData.total || 0;
    const page = apiData.page || 1;
    const pages = apiData.pages || apiData.total_pages || 1;

    // Check if items is an array
    if (!Array.isArray(items)) {
      return { purposes: [], total: 0, page: 1, pages: 1 };
    }

    // Use the consolidated transformation logic
    const transformedPurposes = items.map(purpose => this.transformSinglePurpose(purpose));

    return { purposes: transformedPurposes, total, page, pages };
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
      case 'SIGNED':
        return 'SIGNED';
      case 'PARTIALLY_SUPPLIED':
        return 'PARTIALLY_SUPPLIED';
      default:
        return status;
    }
  }

  private mapApiCurrencyToFrontend(currency: string): Currency {
    switch (currency) {
      case 'ILS':
        return Currency.ILS;
      case 'SUPPORT_USD':
        return Currency.SUPPORT_USD;
      case 'AVAILABLE_USD':
        return Currency.AVAILABLE_USD;
      case 'USD':
        return Currency.SUPPORT_USD; // Default old USD values to SUPPORT_USD
      default:
        return currency as Currency;
    }
  }
}

export const purposeService = new PurposeService();
