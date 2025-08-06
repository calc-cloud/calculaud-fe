import { describe, it, expect, vi, beforeEach } from "vitest";

import { apiService } from "../apiService";
import { purposeService } from "../purposeService";

// Mock the apiService
vi.mock("../apiService", () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    downloadBlob: vi.fn(),
  },
}));

describe("PurposeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPurposes", () => {
    it("should call apiService.get with correct endpoint and params", async () => {
      const mockResponse = {
        items: [{ id: 1, description: "Test Purpose" }],
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const params = { search: "test", page: 1, limit: 10 };
      const result = await purposeService.getPurposes(params);

      expect(apiService.get).toHaveBeenCalledWith("/purposes/", params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("mapFiltersToApiParams", () => {
    it("should map unified filters to API parameters correctly", () => {
      const filters = {
        search_query: "test search",
        hierarchy_id: [1, 2],
        supplier: [1, 2],
        service_type: [1, 2],
        material: [1, 2],
        status: ["active"],
        pending_authority: [1],
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      };

      const sortConfig = { field: "created_at", direction: "desc" as const };
      const page = 1;
      const limit = 20;

      const result = purposeService.mapFiltersToApiParams(filters, sortConfig, page, limit);

      expect(result).toMatchObject({
        search: "test search",
        hierarchy_id: [1, 2], // Multiple values remain as array
        supplier_id: [1, 2],
        service_type_id: [1, 2],
        service_id: [1, 2],
        pending_authority_id: 1, // Single value becomes single number
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        sort_order: "desc",
        page: 1,
        limit: 20,
      });
    });

    it("should handle empty filters", () => {
      const filters = {};
      const sortConfig = { field: "id", direction: "asc" as const };

      const result = purposeService.mapFiltersToApiParams(filters, sortConfig, 1, 10);

      expect(result).toMatchObject({
        sort_order: "asc",
        page: 1,
        limit: 10,
      });
    });

    it("should handle single values in arrays", () => {
      const filters = {
        hierarchy_id: [5],
        supplier: [123],
      };
      const sortConfig = { field: "id", direction: "asc" as const };

      const result = purposeService.mapFiltersToApiParams(filters, sortConfig, 1, 10);

      expect(result).toMatchObject({
        hierarchy_id: 5, // Single value becomes single number
        supplier_id: 123,
        sort_order: "asc",
        page: 1,
        limit: 10,
      });
    });
  });

  describe("exportPurposesCSV", () => {
    it("should call apiService.downloadBlob with correct endpoint and params", async () => {
      const mockResponse = new Response();
      vi.mocked(apiService.downloadBlob).mockResolvedValue(mockResponse);

      const params = {
        search: "test",
        hierarchy_id: [1, 2],
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      };

      const result = await purposeService.exportPurposesCSV(params);

      expect(apiService.downloadBlob).toHaveBeenCalledWith("/purposes/export_csv", params);
      expect(result).toBe(mockResponse);
    });

    it("should handle empty params", async () => {
      const mockResponse = new Response();
      vi.mocked(apiService.downloadBlob).mockResolvedValue(mockResponse);

      await purposeService.exportPurposesCSV({});

      expect(apiService.downloadBlob).toHaveBeenCalledWith("/purposes/export_csv", {});
    });
  });

  describe("error handling", () => {
    it("should propagate API errors from getPurposes", async () => {
      const error = new Error("Network Error");
      vi.mocked(apiService.get).mockRejectedValue(error);

      await expect(purposeService.getPurposes({ page: 1, limit: 10 })).rejects.toThrow("Network Error");
    });

    it("should propagate API errors from exportPurposesCSV", async () => {
      const error = new Error("Export Error");
      vi.mocked(apiService.downloadBlob).mockRejectedValue(error);

      await expect(purposeService.exportPurposesCSV({})).rejects.toThrow("Export Error");
    });
  });
});
