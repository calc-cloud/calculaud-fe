import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from "@/components/common/ColumnControl";

const COLUMN_VISIBILITY_KEY = "search-column-visibility";
const COLUMN_SIZING_KEY = "search-column-sizing";

// Column sizing type - maps column IDs to their widths
export type ColumnSizing = Record<string, number>;

// Default column sizes extracted from column definitions
export const DEFAULT_COLUMN_SIZING: ColumnSizing = {
  status: 140,
  statusMessage: 180,
  description: 300,
  content: 200,
  supplier: 120,
  hierarchy: 80,
  serviceType: 140,
  purchases: 320,
  emfIds: 120,
  demandIds: 120,
  totalCost: 140,
  expectedDelivery: 120,
  createdAt: 120,
  lastModified: 120,
};

/**
 * Save column visibility settings to localStorage
 */
export const saveColumnVisibility = (columnVisibility: ColumnVisibility): void => {
  localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(columnVisibility));
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
    const isValid = expectedKeys.every((key) => key in parsed && typeof parsed[key] === "boolean");

    if (!isValid) {
      return DEFAULT_COLUMN_VISIBILITY;
    }

    return parsed as ColumnVisibility;
  } catch (_error) {
    return DEFAULT_COLUMN_VISIBILITY;
  }
};

/**
 * Clear column visibility settings from localStorage
 */
export const clearColumnVisibility = (): void => {
  localStorage.removeItem(COLUMN_VISIBILITY_KEY);
};

/**
 * Save column sizing settings to localStorage
 */
export const saveColumnSizing = (columnSizing: ColumnSizing): void => {
  localStorage.setItem(COLUMN_SIZING_KEY, JSON.stringify(columnSizing));
};

/**
 * Load column sizing settings from localStorage
 * Falls back to DEFAULT_COLUMN_SIZING if localStorage is unavailable or data is invalid
 */
export const loadColumnSizing = (): ColumnSizing => {
  try {
    const stored = localStorage.getItem(COLUMN_SIZING_KEY);
    if (!stored) {
      return DEFAULT_COLUMN_SIZING;
    }

    const parsed = JSON.parse(stored);

    // Validate that the parsed data is an object with numeric values
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_COLUMN_SIZING;
    }

    // Filter out invalid entries and merge with defaults
    const validSizing: ColumnSizing = {};

    // Start with defaults to ensure all columns have sizes
    Object.assign(validSizing, DEFAULT_COLUMN_SIZING);

    // Override with valid stored values
    Object.entries(parsed).forEach(([columnId, width]) => {
      if (typeof width === "number" && width > 0 && columnId in DEFAULT_COLUMN_SIZING) {
        validSizing[columnId] = width;
      }
    });

    return validSizing;
  } catch (_error) {
    return DEFAULT_COLUMN_SIZING;
  }
};

/**
 * Clear column sizing settings from localStorage
 */
export const clearColumnSizing = (): void => {
  localStorage.removeItem(COLUMN_SIZING_KEY);
};
