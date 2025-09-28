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
vi.mock("date-fns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("date-fns")>();
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      // Simple mock implementation for consistent test results
      if (formatStr === "dd/MM/yy") {
        return "01/01/24";
      }
      return "2024-01-01";
    }),
    subDays: vi.fn((date: Date, amount: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() - amount);
      return result;
    }),
    subWeeks: vi.fn((date: Date, amount: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() - amount * 7);
      return result;
    }),
    subMonths: vi.fn((date: Date, amount: number) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - amount);
      return result;
    }),
    subYears: vi.fn((date: Date, amount: number) => {
      const result = new Date(date);
      result.setFullYear(result.getFullYear() - amount);
      return result;
    }),
    startOfDay: vi.fn((date: Date) => {
      const result = new Date(date);
      result.setHours(0, 0, 0, 0);
      return result;
    }),
    endOfDay: vi.fn((date: Date) => {
      const result = new Date(date);
      result.setHours(23, 59, 59, 999);
      return result;
    }),
  };
});

// Mock react-oidc-context
export const mockUser = {
  access_token: "mock-access-token",
  profile: {
    sub: "mock-user-id",
    email: "test@example.com",
    unique_name: "Test User",
    preferred_username: "testuser",
    upn: "test@example.com",
    role: "calAdmins" as string | string[], // Default to admin role for tests
  },
};

export const mockAuth = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  signinRedirect: vi.fn(),
  signoutRedirect: vi.fn(),
};

vi.mock("react-oidc-context", () => ({
  useAuth: () => mockAuth,
}));

// Mock environment variables - this will be applied globally
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_ADMIN_ROLE: "calAdmins",
    VITE_USER_ROLE: "calUsers",
    VITE_ROLE_CLAIM_PATH: "role",
  },
  writable: true,
});

// Helper functions to change user roles in tests
export const setUserRole = (role: string | string[]) => {
  mockAuth.user.profile.role = role;
};

export const setAdminUser = () => {
  setUserRole("calAdmins");
};

export const setRegularUser = () => {
  setUserRole("calUsers");
};

export const setUnauthenticatedUser = () => {
  mockAuth.isAuthenticated = false;
  mockAuth.user = null;
};

export const setAuthenticatedUser = () => {
  mockAuth.isAuthenticated = true;
  mockAuth.user = mockUser;
};

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
  mockAuth.signinRedirect.mockReset();
  mockAuth.signoutRedirect.mockReset();

  // Reset auth state to default
  mockAuth.isAuthenticated = true;
  mockAuth.isLoading = false;
  mockAuth.error = null;
  mockAuth.user = mockUser;
  setAdminUser(); // Default to admin user
};
