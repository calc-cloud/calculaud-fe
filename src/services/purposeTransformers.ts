import { Purpose } from '@/types/purposeApi';

import { mapApiStatusToFrontend, mapApiCurrencyToFrontend, getHierarchyName } from './purposeHelpers';

/**
 * Transforms a single API Purpose object to match frontend data structure
 */
export const transformApiPurpose = (apiPurpose: Purpose, hierarchies: any[] = []): any => {
  return {
    id: apiPurpose.id.toString(),
    description: apiPurpose.description,
    contents: (apiPurpose.contents || []).map(content => ({
      material_id: content.service_id,
      material_name: content.service_name,
      material_type: content.service_type,
      quantity: content.quantity,
      // Keep API fields for compatibility
      service_id: content.service_id,
      service_name: content.service_name,
      service_type: content.service_type
    })),
    supplier: apiPurpose.supplier,
    hierarchy_id: apiPurpose.hierarchy?.id?.toString() || '',
    hierarchy_name: apiPurpose.hierarchy?.path || getHierarchyName(apiPurpose.hierarchy?.id || null, hierarchies),
    status: mapApiStatusToFrontend(apiPurpose.status),
    expected_delivery: apiPurpose.expected_delivery,
    comments: apiPurpose.comments,
    service_type: apiPurpose.service_type,
    creation_time: apiPurpose.creation_time,
    last_modified: apiPurpose.last_modified,
    pending_authority: apiPurpose.pending_authority || null,
    purchases: (apiPurpose.purchases || []).map(purchase => ({
      id: purchase.id?.toString() || '',
      purpose_id: apiPurpose.id?.toString() || '',
      creation_date: purchase.creation_date || '',
      costs: (purchase.costs || []).map(cost => ({
        id: cost.id?.toString() || '',
        purchase_id: cost.purchase_id?.toString() || '',
        amount: cost.amount || 0,
        currency: mapApiCurrencyToFrontend(cost.currency || ''),
      })),
      flow_stages: (purchase.flow_stages || [])
        .flatMap((item: any) => Array.isArray(item) ? item : [item]) // Flatten nested stage arrays
        .map((stage: any) => ({
          id: stage.id?.toString() || '',
          purchase_id: purchase.id?.toString() || '',
          stage_type_id: stage.stage_type_id || 0,
          priority: stage.priority || 0,
          value: stage.value || null,
          completion_date: stage.completion_date || null,
          days_since_previous_stage: stage.days_since_previous_stage ?? null,
          stage_type: stage.stage_type || { id: '', name: '', value_required: false }
        })),
      current_pending_stages: (purchase.current_pending_stages || []).map((stage: any) => ({
        id: stage.id?.toString() || '',
        purchase_id: purchase.id?.toString() || '',
        stage_type_id: stage.stage_type_id || 0,
        priority: stage.priority || 0,
        value: stage.value || null,
        completion_date: stage.completion_date || null,
        days_since_previous_stage: stage.days_since_previous_stage ?? null,
        stage_type: stage.stage_type || { id: '', name: '', value_required: false }
      })),
      days_since_last_completion: purchase.days_since_last_completion ?? null,
      files: [] // Files would come from a separate endpoint
    })),
    files: (apiPurpose.file_attachments || []).map(file => ({
      id: file.id.toString(),
      purpose_id: apiPurpose.id.toString(),
      filename: file.original_filename,
      file_url: file.file_url,
      upload_date: file.uploaded_at,
      file_size: file.file_size
    }))
  };
};

/**
 * Transforms API response data to frontend format
 */
export const transformApiResponse = (apiData: any): {
  purposes: any[];
  total: number;
  page: number;
  pages: number;
} => {
  // Handle case where apiData is null/undefined
  if (!apiData) {
    return {
      purposes: [],
      total: 0,
      page: 1,
      pages: 1
    };
  }

  // Handle different possible response formats
  const items = apiData.items || apiData.data || [];
  const total = apiData.total || 0;
  const page = apiData.page || 1;
  const pages = apiData.pages || apiData.total_pages || 1;

  // Check if items is an array
  if (!Array.isArray(items)) {
    return {
      purposes: [],
      total: 0,
      page: 1,
      pages: 1
    };
  }

  const transformedPurposes = items.map(purpose => {
    try {
      return {
        id: purpose.id?.toString() || '',
        description: purpose.description || '',
        contents: purpose.contents || purpose.content || [], // Support both field names
        supplier: purpose.supplier || '',
        hierarchy_id: purpose.hierarchy ? purpose.hierarchy.id.toString() : '',
        hierarchy_name: purpose.hierarchy ? purpose.hierarchy.path : '',
        status: mapApiStatusToFrontend(purpose.status || ''),
        expected_delivery: purpose.expected_delivery || '',
        comments: purpose.comments || '',
        service_type: purpose.service_type || '',
        creation_time: purpose.creation_time || '',
        last_modified: purpose.last_modified || '',
        pending_authority: purpose.pending_authority || null,
        purchases: (purpose.purchases || []).map(purchase => ({
          id: purchase.id?.toString() || '',
          purpose_id: purpose.id?.toString() || '',
          creation_date: purchase.creation_date || '',
          costs: (purchase.costs || []).map(cost => ({
            id: cost.id?.toString() || '',
            purchase_id: cost.purchase_id?.toString() || '',
            amount: cost.amount || 0,
            currency: mapApiCurrencyToFrontend(cost.currency || ''),
          })),
          flow_stages: (purchase.flow_stages || [])
            .flatMap((item: any) => Array.isArray(item) ? item : [item]) // Flatten nested stage arrays
            .map((stage: any) => ({
              id: stage.id?.toString() || '',
              purchase_id: purchase.id?.toString() || '',
              stage_type_id: stage.stage_type_id || 0,
              priority: stage.priority || 0,
              value: stage.value || null,
              completion_date: stage.completion_date || null,
              days_since_previous_stage: stage.days_since_previous_stage ?? null,
              stage_type: stage.stage_type || { id: '', name: '', value_required: false }
            })),
          days_since_last_completion: purchase.days_since_last_completion ?? null,
          files: [] // API doesn't return files yet
        })),
        files: (purpose.file_attachments || []).map((file: any) => ({
          id: file.id?.toString() || '',
          purpose_id: purpose.id?.toString() || '',
          filename: file.original_filename || '',
          file_url: file.file_url || '',
          upload_date: file.uploaded_at || '',
          file_size: file.file_size || 0
        }))
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
  });

  return {
    purposes: transformedPurposes,
    total,
    page,
    pages
  };
};