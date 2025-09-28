import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import type { PurposeStatus } from "@/types";
import type { HierarchyType } from "@/types/hierarchies";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Common test utilities
export const createMockQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock user event helper
export const mockUserEvent = {
  click: vi.fn(),
  type: vi.fn(),
  clear: vi.fn(),
  selectOptions: vi.fn(),
  keyboard: vi.fn(),
};

// Common mock data generators
export const mockPurpose = (overrides = {}) => ({
  id: "1",
  description: "Test Purpose",
  contents: [],
  supplier: "Test Supplier",
  hierarchy_id: "1",
  hierarchy_name: "Test Hierarchy",
  status: "IN_PROGRESS" as PurposeStatus,
  expected_delivery: "2024-12-31",
  comments: "Test comments",
  service_type: "Test Service Type",
  creation_time: "2024-01-01T00:00:00Z",
  last_modified: "2024-01-01T00:00:00Z",
  current_status_changed_at: "2024-01-01T00:00:00Z",
  purchases: [],
  files: [],
  pending_authority: undefined,
  is_flagged: false,
  ...overrides,
});

export const mockHierarchy = (overrides = {}) => ({
  id: 1,
  name: "Test Hierarchy",
  type: "UNIT" as HierarchyType,
  parent_id: null,
  path: "Test Hierarchy",
  ...overrides,
});

export const mockSupplier = (overrides = {}) => ({
  id: 1,
  name: "Test Supplier",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const mockServiceType = (overrides = {}) => ({
  id: 1,
  name: "Test Service Type",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const mockMaterial = (overrides = {}) => ({
  id: 1,
  name: "Test Material",
  service_type_id: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const mockResponsibleAuthority = (overrides = {}) => ({
  id: 1,
  name: "Test Authority",
  description: "Test Authority Description",
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

// Mock API responses
export const mockPaginatedResponse = (items: any[], total = items.length) => ({
  items,
  total,
  page: 1,
  limit: 10,
  pages: Math.ceil(total / 10),
});

// Mock React Query hooks
export const createMockUseQuery = (data: any, isLoading = false, error = null) => ({
  data,
  isLoading,
  error,
  refetch: vi.fn(),
  isError: !!error,
  isSuccess: !isLoading && !error,
});

export const createMockUseMutation = () => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isLoading: false,
  error: null,
  isError: false,
  isSuccess: false,
  reset: vi.fn(),
});
