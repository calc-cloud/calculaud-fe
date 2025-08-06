import { describe, it, expect, vi, beforeEach } from "vitest";

import { purposeService } from "@/services/purposeService";

import { exportPurposesToCSV } from "../csvExport";

// Mock the purpose service
vi.mock("@/services/purposeService", () => ({
  purposeService: {
    mapFiltersToApiParams: vi.fn(),
    exportPurposesCSV: vi.fn(),
  },
}));

describe("csvExport", () => {
  const mockToast = vi.fn();
  const mockSetIsLoading = vi.fn();

  const mockFilters = {
    relative_time: "last_month",
    hierarchy_id: [1],
    service_type: [1],
  };

  const mockSortConfig = {
    field: "creation_time" as const,
    direction: "desc" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API params mapping
    vi.mocked(purposeService.mapFiltersToApiParams).mockReturnValue({
      hierarchy_id: [1],
      service_type_id: [1],
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      page: 1,
      limit: 999999,
    });
  });

  it("should successfully export CSV with correct parameters", async () => {
    // Mock successful API response
    const mockBlob = new Blob(["csv,data\ntest,value"], { type: "text/csv" });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: {
        get: vi.fn().mockReturnValue('attachment; filename="test-export.csv"'),
      },
    };

    vi.mocked(purposeService.exportPurposesCSV).mockResolvedValue(mockResponse as any);

    await exportPurposesToCSV(mockFilters, mockSortConfig, mockToast, mockSetIsLoading);

    // Verify API was called with correct parameters
    expect(purposeService.mapFiltersToApiParams).toHaveBeenCalledWith(mockFilters, mockSortConfig, 1, 999999);

    expect(purposeService.exportPurposesCSV).toHaveBeenCalledWith({
      hierarchy_id: [1],
      service_type_id: [1],
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      // page and limit should be removed
    });

    // Verify loading states
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);

    // Verify success toast
    expect(mockToast).toHaveBeenCalledWith({
      title: "Export completed",
      description: "Successfully exported purposes to CSV with all applied filters and sorting.",
    });
  });

  it("should handle API errors gracefully", async () => {
    const error = new Error("API Error");
    vi.mocked(purposeService.exportPurposesCSV).mockRejectedValue(error);

    await exportPurposesToCSV(mockFilters, mockSortConfig, mockToast, mockSetIsLoading);

    // Verify error toast
    expect(mockToast).toHaveBeenCalledWith({
      title: "Export failed",
      description: "API Error",
      variant: "destructive",
    });

    // Verify loading is set to false
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it("should use default filename when Content-Disposition header is missing", async () => {
    const mockBlob = new Blob(["test"], { type: "text/csv" });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    };

    vi.mocked(purposeService.exportPurposesCSV).mockResolvedValue(mockResponse as any);

    await exportPurposesToCSV(mockFilters, mockSortConfig, mockToast);

    // Should still call success toast (indicating the export worked)
    expect(mockToast).toHaveBeenCalledWith({
      title: "Export completed",
      description: "Successfully exported purposes to CSV with all applied filters and sorting.",
    });
  });

  it("should work without setIsLoading callback", async () => {
    const mockBlob = new Blob(["test"], { type: "text/csv" });
    const mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob),
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    };

    vi.mocked(purposeService.exportPurposesCSV).mockResolvedValue(mockResponse as any);

    // Should not throw when setIsLoading is undefined
    await expect(exportPurposesToCSV(mockFilters, mockSortConfig, mockToast)).resolves.not.toThrow();

    expect(mockToast).toHaveBeenCalledWith({
      title: "Export completed",
      description: "Successfully exported purposes to CSV with all applied filters and sorting.",
    });
  });
});
