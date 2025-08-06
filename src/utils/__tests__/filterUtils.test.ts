import { describe, it, expect, vi, beforeEach } from "vitest";

import { UnifiedFilters } from "@/types/filters";

import {
  calculateDateRange,
  handleRelativeTimeChange,
  handleDateChange,
  clearFilters,
  createToggleFunction,
} from "../filterUtils";

// Mock date-fns to have predictable test results
vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      if (formatStr === "yyyy-MM-dd") {
        return date.toISOString().split("T")[0];
      }
      return date.toISOString();
    }),
  };
});

describe("filterUtils", () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15 for consistent testing
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  describe("calculateDateRange", () => {
    it("should return undefined for all_time", () => {
      const result = calculateDateRange("all_time");
      expect(result).toBeUndefined();
    });

    it("should calculate last_7_days correctly", () => {
      const result = calculateDateRange("last_7_days");
      expect(result).toEqual({
        start_date: "2024-01-08",
        end_date: "2024-01-15",
      });
    });

    it("should calculate last_30_days correctly", () => {
      const result = calculateDateRange("last_30_days");
      expect(result).toEqual({
        start_date: "2023-12-16",
        end_date: "2024-01-15",
      });
    });

    it("should calculate last_3_months correctly", () => {
      const result = calculateDateRange("last_3_months");
      expect(result).toEqual({
        start_date: "2023-10-15",
        end_date: "2024-01-15",
      });
    });

    it("should return undefined for unknown relative time", () => {
      const result = calculateDateRange("unknown_time");
      expect(result).toBeUndefined();
    });
  });

  describe("handleRelativeTimeChange", () => {
    const mockOnFiltersChange = vi.fn();
    const mockCurrentFilters: UnifiedFilters = {
      relative_time: "last_7_days",
      hierarchy_id: [1],
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle all_time selection", () => {
      handleRelativeTimeChange("all_time", mockCurrentFilters, mockOnFiltersChange);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockCurrentFilters,
        relative_time: "all_time",
        start_date: undefined,
        end_date: undefined,
      });
    });

    it("should handle last_7_days selection", () => {
      handleRelativeTimeChange("last_7_days", mockCurrentFilters, mockOnFiltersChange);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockCurrentFilters,
        relative_time: "last_7_days",
        start_date: "2024-01-08",
        end_date: "2024-01-15",
      });
    });
  });

  describe("handleDateChange", () => {
    const mockOnFiltersChange = vi.fn();
    const mockCurrentFilters: UnifiedFilters = {
      relative_time: "last_7_days",
      start_date: "2024-01-01",
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should update start_date and set relative_time to custom", () => {
      handleDateChange("start_date", "2024-01-10", mockCurrentFilters, mockOnFiltersChange);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockCurrentFilters,
        start_date: "2024-01-10",
        relative_time: "custom",
      });
    });

    it("should update end_date and set relative_time to custom", () => {
      handleDateChange("end_date", "2024-01-20", mockCurrentFilters, mockOnFiltersChange);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockCurrentFilters,
        end_date: "2024-01-20",
        relative_time: "custom",
      });
    });
  });

  describe("clearFilters", () => {
    const mockOnFiltersChange = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should reset to default filters", () => {
      clearFilters(mockOnFiltersChange);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        relative_time: "all_time",
      });
    });

    it("should preserve search_query when clearing filters", () => {
      const currentFilters: UnifiedFilters = {
        search_query: "test search",
        hierarchy_id: [1],
        relative_time: "last_7_days",
      };

      clearFilters(mockOnFiltersChange, currentFilters);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        relative_time: "all_time",
        search_query: "test search",
      });
    });
  });

  describe("createToggleFunction", () => {
    const mockOnFiltersChange = vi.fn();
    const mockFilters: UnifiedFilters = {
      hierarchy_id: [1, 2],
      relative_time: "all_time",
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should add item to empty array", () => {
      const filtersWithoutHierarchy: UnifiedFilters = {
        relative_time: "all_time",
      };

      const toggleFunction = createToggleFunction("hierarchy_id", filtersWithoutHierarchy, mockOnFiltersChange);
      toggleFunction(3);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        relative_time: "all_time",
        hierarchy_id: [3],
      });
    });

    it("should add new item to existing array", () => {
      const toggleFunction = createToggleFunction("hierarchy_id", mockFilters, mockOnFiltersChange);
      toggleFunction(3);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        hierarchy_id: [1, 2, 3],
      });
    });

    it("should remove existing item from array", () => {
      const toggleFunction = createToggleFunction("hierarchy_id", mockFilters, mockOnFiltersChange);
      toggleFunction(1);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        hierarchy_id: [2],
      });
    });

    it("should set array to undefined when removing last item", () => {
      const filtersWithOneItem: UnifiedFilters = {
        hierarchy_id: [1],
        relative_time: "all_time",
      };

      const toggleFunction = createToggleFunction("hierarchy_id", filtersWithOneItem, mockOnFiltersChange);
      toggleFunction(1);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        relative_time: "all_time",
        hierarchy_id: undefined,
      });
    });
  });
});
