import { UnifiedFilters } from '@/types/filters';
import { CreatePurposeRequest, UpdatePurposeRequest, PurposeApiParams } from '@/types/purposeApi';

import { mapSortField, mapStatusToApi, filterValidContents } from './purposeHelpers';

/**
 * Maps frontend filters to API parameters
 */
export const mapFiltersToApiParams = (
  filters: UnifiedFilters, 
  sortConfig: { field: string; direction: string },
  currentPage: number,
  itemsPerPage: number
): PurposeApiParams => {
  const params: PurposeApiParams = {
    page: currentPage,
    limit: itemsPerPage, // Changed from size to limit
    sort_by: mapSortField(sortConfig.field),
    sort_order: sortConfig.direction as 'asc' | 'desc'
  };

  // Search query
  if (filters.search_query) {
    params.search = filters.search_query;
  }

  // Status filter - handle multiple statuses
  if (filters.status && filters.status.length > 0) {
    params.status = filters.status.map(status => mapStatusToApi(status));
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
};

/**
 * Maps frontend purpose data to create request format
 */
export const mapPurposeToCreateRequest = (purposeData: any): CreatePurposeRequest => {
  const mapped: CreatePurposeRequest = {
    description: purposeData.description,
    contents: filterValidContents(purposeData.contents || []), // Filter out invalid contents
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

  // Map purchases if provided - Fixed field mapping to use creation_date
  if (purposeData.purchases && purposeData.purchases.length > 0) {
    mapped.purchases = purposeData.purchases.map((purchase: any) => ({
      creation_date: purchase.creation_date || undefined, // Use creation_date field
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

  return mapped;
};

/**
 * Maps frontend purpose data to update request format
 */
export const mapPurposeToUpdateRequest = (purposeData: any): UpdatePurposeRequest => {
  const mapped: UpdatePurposeRequest = {};

  if (purposeData.description !== undefined) {
    mapped.description = purposeData.description;
  }
  if (purposeData.contents !== undefined) { // Changed from content to contents
    mapped.contents = filterValidContents(purposeData.contents); // Filter out invalid contents
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

  // Map purchases - Fixed field mapping to use creation_date
  if (purposeData.purchases !== undefined) {
    mapped.purchases = purposeData.purchases.map((purchase: any) => ({
      creation_date: purchase.creation_date || undefined, // Use creation_date field
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

  return mapped;
};