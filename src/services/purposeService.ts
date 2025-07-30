import {apiService} from '@/services/apiService';
import {CreatePurchaseRequest as PurchaseCreateRequest} from '@/types';
import {UnifiedFilters} from '@/types/filters';
import {Purpose, PurposeApiParams, PurposeApiResponse, CreatePurposeRequest, UpdatePurposeRequest, Purchase} from '@/types/purposeApi';

import {mapFiltersToApiParams, mapPurposeToCreateRequest, mapPurposeToUpdateRequest} from './purposeMappers';
import {transformApiPurpose, transformApiResponse} from './purposeTransformers';

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
    return mapFiltersToApiParams(filters, sortConfig, currentPage, itemsPerPage);
  }


  // Simplified mapping - IDs are already provided from the modal
  mapPurposeToCreateRequest(purposeData: any): CreatePurposeRequest {
    return mapPurposeToCreateRequest(purposeData);
  }

  // Simplified update request mapping
  mapPurposeToUpdateRequest(purposeData: any): UpdatePurposeRequest {
    return mapPurposeToUpdateRequest(purposeData);
  }


  // Transform API response to match frontend data structure
  transformApiPurpose(apiPurpose: Purpose, hierarchies: any[] = []): any {
    return transformApiPurpose(apiPurpose, hierarchies);
  }

  transformApiResponse(apiData: any): {
    purposes: any[];
    total: number;
    page: number;
    pages: number;
  } {
    return transformApiResponse(apiData);
  }

}

export const purposeService = new PurposeService();
