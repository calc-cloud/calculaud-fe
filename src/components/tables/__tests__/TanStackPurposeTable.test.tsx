import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { mockNavigate, resetAllMocks } from "@/test/mocks";
import { render, screen, mockPurpose, mockHierarchy } from "@/test/testUtils";
import type { PurposeStatus } from "@/types";

import { TanStackPurposeTable } from "../TanStackPurposeTable";

// Mock the AdminDataContext
const mockAdminData = {
  hierarchies: [mockHierarchy({ id: 1, name: "Hierarchy 1" }), mockHierarchy({ id: 2, name: "Hierarchy 2" })],
  suppliers: [],
  serviceTypes: [],
  materials: [],
  responsibleAuthorities: [],
  isLoading: false,
};

vi.mock("@/contexts/AdminDataContext", () => ({
  useAdminData: () => mockAdminData,
}));

// Mock column storage utils
vi.mock("@/utils/columnStorage", () => ({
  loadColumnSizing: vi.fn(() => ({})),
  saveColumnSizing: vi.fn(),
}));

// Mock the columns module
vi.mock("../columns", () => ({
  createColumns: vi.fn(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }: any) => getValue(),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }: any) => getValue(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }: any) => getValue(),
    },
  ]),
}));

describe("TanStackPurposeTable", () => {
  const mockPurposes = [
    mockPurpose({
      id: "1",
      description: "Purpose 1",
      status: "IN_PROGRESS" as PurposeStatus,
    }),
    mockPurpose({
      id: "2",
      description: "Purpose 2",
      status: "COMPLETED" as PurposeStatus,
    }),
  ];

  const mockColumnVisibility = {
    status: true,
    statusMessage: true,
    description: true,
    content: false,
    supplier: true,
    pendingAuthority: false,
    hierarchy: true,
    serviceType: true,
    purchases: false,
    emfIds: false,
    demandIds: false,
    orderIds: false,
    totalCost: true,
    expectedDelivery: false,
    createdAt: false,
    lastModified: false,
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("renders loading state", () => {
    render(<TanStackPurposeTable purposes={[]} isLoading />);

    expect(screen.getByText("Loading purposes...")).toBeInTheDocument();
  });

  it("renders empty state when no purposes", () => {
    render(<TanStackPurposeTable purposes={[]} isLoading={false} />);

    expect(screen.getByText("No purposes found.")).toBeInTheDocument();
  });

  it("renders table with purposes", () => {
    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    // Should render table headers
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Should render purpose data
    expect(screen.getByText("Purpose 1")).toBeInTheDocument();
    expect(screen.getByText("Purpose 2")).toBeInTheDocument();
    expect(screen.getByText("IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("navigates to purpose detail when row is clicked", async () => {
    const user = userEvent.setup();

    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    const firstRow = screen.getByText("Purpose 1").closest("tr");
    expect(firstRow).toBeInTheDocument();

    if (firstRow) {
      await user.click(firstRow);
    }

    expect(mockNavigate).toHaveBeenCalledWith("/purposes/1");
  });

  it("applies column visibility settings", () => {
    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} columnVisibility={mockColumnVisibility} />);

    // The table should render with the provided column visibility
    // Since we're mocking the columns, we can't test specific column visibility,
    // but we can ensure the component renders without error
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("handles sort configuration", () => {
    const mockSortConfig = {
      field: "creation_time" as const,
      direction: "asc" as const,
    };
    const mockOnSortChange = vi.fn();

    render(
      <TanStackPurposeTable
        purposes={mockPurposes}
        isLoading={false}
        sortConfig={mockSortConfig}
        onSortChange={mockOnSortChange}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    // The sort config is passed to createColumns, which is mocked
  });

  it("handles column sizing", () => {
    const mockColumnSizing = {
      id: 100,
      description: 200,
      status: 150,
    };
    const mockOnColumnSizingChange = vi.fn();

    render(
      <TanStackPurposeTable
        purposes={mockPurposes}
        isLoading={false}
        columnSizing={mockColumnSizing}
        onColumnSizingChange={mockOnColumnSizingChange}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders table with proper styling classes", () => {
    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    const table = screen.getByRole("table");
    // The table's immediate parent has "relative w-full overflow-auto",
    // but we want the outer div with "rounded-md border"
    const outerDiv = table.closest("div")?.parentElement;
    expect(outerDiv).toHaveClass("rounded-md", "border");

    // Check that rows have hover styling
    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1); // Skip header row
    expect(dataRows[0]).toHaveClass("cursor-pointer", "hover:bg-muted/50", "h-20");
  });

  it("displays all purposes in the table", () => {
    const manyPurposes = [
      mockPurpose({ id: 1, description: "Purpose 1" }),
      mockPurpose({ id: 2, description: "Purpose 2" }),
      mockPurpose({ id: 3, description: "Purpose 3" }),
    ];

    render(<TanStackPurposeTable purposes={manyPurposes} isLoading={false} />);

    expect(screen.getByText("Purpose 1")).toBeInTheDocument();
    expect(screen.getByText("Purpose 2")).toBeInTheDocument();
    expect(screen.getByText("Purpose 3")).toBeInTheDocument();
  });

  it("handles empty purposes array", () => {
    render(<TanStackPurposeTable purposes={[]} isLoading={false} />);

    expect(screen.getByText("No purposes found.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("calls createColumns with correct parameters", async () => {
    const mockSortConfig = {
      field: "creation_time" as const,
      direction: "asc" as const,
    };
    const mockOnSortChange = vi.fn();

    const { createColumns } = await import("../columns");

    render(
      <TanStackPurposeTable
        purposes={mockPurposes}
        isLoading={false}
        sortConfig={mockSortConfig}
        onSortChange={mockOnSortChange}
      />
    );

    expect(createColumns).toHaveBeenCalledWith(mockAdminData.hierarchies, mockSortConfig, mockOnSortChange);
  });

  it("renders table headers correctly", () => {
    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    const headerRow = screen.getAllByRole("row")[0];
    expect(headerRow).toBeInTheDocument();

    // Check that headers have proper styling
    const headers = screen.getAllByRole("columnheader");
    headers.forEach((header) => {
      expect(header).toHaveClass("text-center", "relative");
    });
  });

  it("renders table cells correctly", () => {
    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    const cells = screen.getAllByRole("cell");
    cells.forEach((cell) => {
      expect(cell).toHaveClass("text-center");
    });
  });

  it("handles purpose navigation for different purpose IDs", async () => {
    const user = userEvent.setup();

    render(<TanStackPurposeTable purposes={mockPurposes} isLoading={false} />);

    // Click on second purpose
    const secondRow = screen.getByText("Purpose 2").closest("tr");
    if (secondRow) {
      await user.click(secondRow);
    }

    expect(mockNavigate).toHaveBeenCalledWith("/purposes/2");
  });
});
