import { ColumnVisibility, DEFAULT_COLUMN_VISIBILITY } from "@/components/common/ColumnControl";

import { getDefaultColumnSizing } from "./tableUtils";

const COLUMN_VISIBILITY_KEY = "search-column-visibility";
const COLUMN_SIZING_KEY = "search-column-sizing";

// Column sizing type - maps column IDs to their widths
export type ColumnSizing = Record<string, number>;

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

    // Force status column to always be visible
    const columnVisibility = { ...(parsed as ColumnVisibility) };
    columnVisibility.status = true;

    return columnVisibility;
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
 * Falls back to default column sizing from tableUtils if localStorage is unavailable or data is invalid
 */
export const loadColumnSizing = (): ColumnSizing => {
  const defaultSizing = getDefaultColumnSizing();

  try {
    const stored = localStorage.getItem(COLUMN_SIZING_KEY);
    if (!stored) {
      return defaultSizing;
    }

    const parsed = JSON.parse(stored);

    // Validate that the parsed data is an object with numeric values
    if (typeof parsed !== "object" || parsed === null) {
      return defaultSizing;
    }

    // Filter out invalid entries and merge with defaults
    const validSizing: ColumnSizing = {};

    // Start with defaults to ensure all columns have sizes
    Object.assign(validSizing, defaultSizing);

    // Override with valid stored values
    Object.entries(parsed).forEach(([columnId, width]) => {
      if (typeof width === "number" && width > 0 && columnId in defaultSizing) {
        validSizing[columnId] = width;
      }
    });

    return validSizing;
  } catch (_error) {
    return defaultSizing;
  }
};

/**
 * Clear column sizing settings from localStorage
 */
export const clearColumnSizing = (): void => {
  localStorage.removeItem(COLUMN_SIZING_KEY);
};
