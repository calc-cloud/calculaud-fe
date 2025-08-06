import React from "react";
import { vi } from "vitest";

// Mock React Router
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "default",
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock Recharts components to avoid canvas issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  BarChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "bar-chart" }, children),
  PieChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pie-chart" }, children),
  LineChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "line-chart" }, children),
  Bar: () => React.createElement("div", { "data-testid": "bar" }),
  Pie: () => React.createElement("div", { "data-testid": "pie" }),
  Line: () => React.createElement("div", { "data-testid": "line" }),
  XAxis: () => React.createElement("div", { "data-testid": "x-axis" }),
  YAxis: () => React.createElement("div", { "data-testid": "y-axis" }),
  CartesianGrid: () => React.createElement("div", { "data-testid": "cartesian-grid" }),
  Tooltip: () => React.createElement("div", { "data-testid": "tooltip" }),
  Legend: () => React.createElement("div", { "data-testid": "legend" }),
  Cell: () => React.createElement("div", { "data-testid": "cell" }),
}));

// Mock API service
export const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  downloadBlob: vi.fn(),
};

vi.mock("@/services/apiService", () => ({
  apiService: mockApiService,
}));

// Mock React Query hooks
export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
  };
});

// Mock toast
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("sonner", () => ({
  toast: mockToast,
}));

// Mock date-fns to avoid timezone issues in tests
vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      // Simple mock implementation for consistent test results
      if (formatStr === "dd/MM/yy") {
        return "01/01/24";
      }
      return "2024-01-01";
    }),
  };
});

// Reset all mocks
export const resetAllMocks = () => {
  mockNavigate.mockReset();
  mockApiService.get.mockReset();
  mockApiService.post.mockReset();
  mockApiService.patch.mockReset();
  mockApiService.put.mockReset();
  mockApiService.delete.mockReset();
  mockApiService.downloadBlob.mockReset();
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockToast.success.mockReset();
  mockToast.error.mockReset();
  mockToast.info.mockReset();
  mockToast.warning.mockReset();
};
