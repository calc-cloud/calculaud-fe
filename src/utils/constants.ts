// Constants for the Procurement Management System

export const CURRENCIES: Currency[] = [
  'SUPPORT_USD',
  'AVAILABLE_USD',
  'ILS'
];

export const CURRENCY_DISPLAY_NAMES: Record<Currency, string> = {
  'ILS': 'ILS',
  'AVAILABLE_USD': 'דולר זמין',
  'SUPPORT_USD': 'דולר סיוע'
};

// Import types
import type { Currency } from '@/types';


