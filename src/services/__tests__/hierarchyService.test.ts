import { describe, it, expect, vi, beforeEach } from "vitest";

import { apiService } from "../apiService";
import { hierarchyService } from "../hierarchyService";

// Mock the apiService
vi.mock("../apiService", () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("HierarchyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHierarchies", () => {
    it("should call apiService.get with correct endpoint and params", async () => {
      const mockResponse = {
        data: [{ id: 1, name: "Test Hierarchy" }],
        total: 1,
        page: 1,
        limit: 10,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      const params = { search: "test", page: 1, limit: 10 };
      const result = await hierarchyService.getHierarchies(params);

      expect(apiService.get).toHaveBeenCalledWith("/hierarchies/", params);
      expect(result).toEqual(mockResponse);
    });

    it("should work without params", async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      vi.mocked(apiService.get).mockResolvedValue(mockResponse);

      await hierarchyService.getHierarchies();

      expect(apiService.get).toHaveBeenCalledWith("/hierarchies/", undefined);
    });
  });

  describe("createHierarchy", () => {
    it("should call apiService.post with correct data", async () => {
      const mockHierarchy = { id: 1, name: "New Hierarchy", type: "UNIT", parent_id: null };
      const createData = { name: "New Hierarchy", type: "UNIT" as const, parent_id: null };

      vi.mocked(apiService.post).mockResolvedValue(mockHierarchy);

      const result = await hierarchyService.createHierarchy(createData);

      expect(apiService.post).toHaveBeenCalledWith("/hierarchies/", createData);
      expect(result).toEqual(mockHierarchy);
    });
  });

  describe("updateHierarchy", () => {
    it("should call apiService.patch with correct id and data", async () => {
      const mockHierarchy = { id: 1, name: "Updated Hierarchy", type: "UNIT", parent_id: null };
      const updateData = { name: "Updated Hierarchy" };

      vi.mocked(apiService.patch).mockResolvedValue(mockHierarchy);

      const result = await hierarchyService.updateHierarchy(1, updateData);

      expect(apiService.patch).toHaveBeenCalledWith("/hierarchies/1", updateData);
      expect(result).toEqual(mockHierarchy);
    });
  });

  describe("deleteHierarchy", () => {
    it("should call apiService.delete with correct id", async () => {
      vi.mocked(apiService.delete).mockResolvedValue(undefined);

      await hierarchyService.deleteHierarchy(1);

      expect(apiService.delete).toHaveBeenCalledWith("/hierarchies/1");
    });
  });

  describe("error handling", () => {
    it("should propagate API errors", async () => {
      const error = new Error("API Error");
      vi.mocked(apiService.get).mockRejectedValue(error);

      await expect(hierarchyService.getHierarchies()).rejects.toThrow("API Error");
    });
  });
});
