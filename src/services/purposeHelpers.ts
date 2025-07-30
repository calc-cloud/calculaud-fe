import { Currency } from '@/types';

/**
 * Maps frontend sort field names to API field names
 */
export const mapSortField = (field: string): string => {
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
};

/**
 * Maps frontend status labels to API status values
 */
export const mapStatusToApi = (status: string): string => {
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
};

/**
 * Maps API status values to frontend status labels
 */
export const mapApiStatusToFrontend = (status: string): string => {
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
};

/**
 * Maps API currency values to frontend Currency enum
 */
export const mapApiCurrencyToFrontend = (currency: string): Currency => {
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
};

/**
 * Gets hierarchy name from hierarchies list by ID
 */
export const getHierarchyName = (hierarchyId: number | null, hierarchies: any[]): string => {
  if (!hierarchyId) return '';
  const hierarchy = hierarchies.find(h => parseInt(h.id) === hierarchyId);
  return hierarchy ? hierarchy.name : `Hierarchy ${hierarchyId}`;
};

/**
 * Filters out invalid contents from purpose data
 */
export const filterValidContents = (contents: any[]): any[] => {
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
};