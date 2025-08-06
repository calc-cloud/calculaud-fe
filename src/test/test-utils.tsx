import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

// Create a custom render function that includes React Query provider
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data factories for tests
export const createMockPurpose = (overrides = {}) => ({
  id: "1",
  title: "Test Purpose",
  description: "Test Description",
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

export const createMockHierarchy = (overrides = {}) => ({
  id: "1",
  name: "Test Hierarchy",
  level: 1,
  parent_id: null,
  ...overrides,
});

export const createMockSupplier = (overrides = {}) => ({
  id: "1",
  name: "Test Supplier",
  contact_email: "test@supplier.com",
  ...overrides,
});

// Re-export everything from testing library
export * from "@testing-library/react";
export { customRender as render };
export { createTestQueryClient };
