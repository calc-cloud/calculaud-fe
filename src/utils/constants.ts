
// Constants for the Procurement Management System

export const SERVICE_TYPES: ServiceType[] = [
  'Consulting',
  'Software', 
  'Hardware',
  'Maintenance',
  'Training',
  'Other'
];

export const PURPOSE_STATUSES: PurposeStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED'
];

export const CURRENCIES: Currency[] = [
  'SUPPORT_USD',
  'AVAILABLE_USD',
  'ILS'
];

export const TABLE_PAGE_SIZES = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 25;

// Import types
import type { ServiceType, PurposeStatus, Currency } from '@/types';

export const SUPPLIERS = [
  'TechCorp Solutions',
  'Hardware Plus Inc',
  'Strategic Advisors LLC',
  'Global Tech Services',
  'Innovation Partners',
  'Digital Solutions Co',
  'Enterprise Systems Ltd',
  'CloudTech Inc'
] as const;
