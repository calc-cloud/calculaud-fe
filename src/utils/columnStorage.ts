import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from '@/components/common/ColumnControl';

const COLUMN_VISIBILITY_KEY = 'search-column-visibility';

/**
 * Save column visibility settings to localStorage
 */
export const saveColumnVisibility = (columnVisibility: ColumnVisibility): void => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

/**
 * Load column visibility settings from localStorage
 * Falls back to DEFAULT_COLUMN_VISIBILITY if localStorage is unavailable or data is invalid
 */
export const loadColumnVisibility = (): ColumnVisibility => {
  try {
    const stored = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (!stored) {
      return DEFAULT_COLUMN_VISIBILITY;
    }

    const parsed = JSON.parse(stored);
    
    // Validate that all expected keys exist and are booleans
    const expectedKeys = Object.keys(DEFAULT_COLUMN_VISIBILITY) as (keyof ColumnVisibility)[];
    const isValid = expectedKeys.every(key => 
      key in parsed && typeof parsed[key] === 'boolean'
    );

    if (!isValid) {
      console.warn('Invalid column visibility data in localStorage, using defaults');
      return DEFAULT_COLUMN_VISIBILITY;
    }

    return parsed as ColumnVisibility;
  } catch (error) {
    console.warn('Failed to load column visibility from localStorage:', error);
    return DEFAULT_COLUMN_VISIBILITY;
  }
};

/**
 * Clear column visibility settings from localStorage
 */
export const clearColumnVisibility = (): void => {
  try {
    localStorage.removeItem(COLUMN_VISIBILITY_KEY);
  } catch (error) {
    console.warn('Failed to clear column visibility from localStorage:', error);
  }
};