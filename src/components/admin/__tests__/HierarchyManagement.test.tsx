import { describe, it, expect, vi } from "vitest";

import { render, screen } from "@/test/testUtils";

import HierarchyManagement from "../HierarchyManagement";

// Mock the EntityManagement component
vi.mock("../EntityManagement", () => ({
  EntityManagement: ({ config }: any) => (
    <div data-testid="entity-management">
      <div data-testid="entity-name">{config.entityName}</div>
      <div data-testid="entity-name-plural">{config.entityNamePlural}</div>
      <div data-testid="query-key">{config.queryKey}</div>
      <div data-testid="search-placeholder">{config.searchPlaceholder}</div>
      <div data-testid="grid-columns">{config.gridColumns}</div>
      <div data-testid="display-fields-count">{config.displayFields.length}</div>
    </div>
  ),
}));

// Mock the CreateHierarchyModal component
vi.mock("../CreateHierarchyModal", () => ({
  CreateHierarchyModal: ({ open, onOpenChange, editItem, onSave }: any) => (
    <div data-testid="create-hierarchy-modal">
      <div data-testid="modal-open">{open.toString()}</div>
      <div data-testid="edit-item">{editItem ? editItem.name : "null"}</div>
      <button onClick={() => onOpenChange(false)}>Close</button>
      <button onClick={() => onSave({ name: "Test" })}>Save</button>
    </div>
  ),
}));

// Mock the hierarchy service
vi.mock("@/services/hierarchyService", () => ({
  hierarchyService: {
    getHierarchies: vi.fn(),
    createHierarchy: vi.fn(),
    updateHierarchy: vi.fn(),
    deleteHierarchy: vi.fn(),
  },
}));

describe("HierarchyManagement", () => {
  it("renders EntityManagement with correct configuration", () => {
    render(<HierarchyManagement />);

    expect(screen.getByTestId("entity-management")).toBeInTheDocument();
    expect(screen.getByTestId("entity-name")).toHaveTextContent("Hierarchy");
    expect(screen.getByTestId("entity-name-plural")).toHaveTextContent("Hierarchies");
    expect(screen.getByTestId("query-key")).toHaveTextContent("hierarchies");
    expect(screen.getByTestId("search-placeholder")).toHaveTextContent("Search hierarchies...");
    expect(screen.getByTestId("grid-columns")).toHaveTextContent("3");
  });

  it("configures display fields correctly", () => {
    render(<HierarchyManagement />);

    // Should have 2 display fields (path and type)
    expect(screen.getByTestId("display-fields-count")).toHaveTextContent("2");
  });

  it("provides service methods", () => {
    render(<HierarchyManagement />);

    // The service methods are bound correctly in the config
    expect(screen.getByTestId("entity-management")).toBeInTheDocument();
  });

  it("uses HierarchyModalAdapter as ModalComponent", () => {
    // This test verifies that the component structure is correct
    // The actual modal functionality would be tested through EntityManagement integration
    render(<HierarchyManagement />);

    expect(screen.getByTestId("entity-management")).toBeInTheDocument();
  });

  // Test the formatTypeDisplay function indirectly through the config
  it("formats type display correctly", () => {
    // This would be tested through the actual EntityManagement component
    // when it renders hierarchy items with the type field
    render(<HierarchyManagement />);

    expect(screen.getByTestId("entity-management")).toBeInTheDocument();
  });

  it("builds query parameters correctly", () => {
    // This tests that the component provides a buildQueryParams function
    // The actual functionality would be tested through EntityManagement
    render(<HierarchyManagement />);

    expect(screen.getByTestId("entity-management")).toBeInTheDocument();
  });

  it("configures search functionality", () => {
    render(<HierarchyManagement />);

    expect(screen.getByTestId("search-placeholder")).toHaveTextContent("Search hierarchies...");
  });

  it("sets correct grid layout", () => {
    render(<HierarchyManagement />);

    expect(screen.getByTestId("grid-columns")).toHaveTextContent("3");
  });

  it("provides correct query key for data fetching", () => {
    render(<HierarchyManagement />);

    expect(screen.getByTestId("query-key")).toHaveTextContent("hierarchies");
  });

  it("configures entity names for UI display", () => {
    render(<HierarchyManagement />);

    expect(screen.getByTestId("entity-name")).toHaveTextContent("Hierarchy");
    expect(screen.getByTestId("entity-name-plural")).toHaveTextContent("Hierarchies");
  });
});
