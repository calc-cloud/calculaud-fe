import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen } from "@/test/testUtils";

import { TablePagination } from "../TablePagination";

describe("TablePagination", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it("renders pagination with correct page numbers", () => {
    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    // Should show pages around current page (1, 2, 3, 4, 5)
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("highlights current page as active", () => {
    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    const currentPageLink = screen.getByText("3");
    expect(currentPageLink).toHaveAttribute("aria-current", "page");
  });

  it("handles page number clicks", async () => {
    const user = userEvent.setup();

    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    const page5Link = screen.getByText("5");
    await user.click(page5Link);

    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it("handles previous button click", async () => {
    const user = userEvent.setup();

    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByLabelText(/previous/i);
    await user.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("handles next button click", async () => {
    const user = userEvent.setup();

    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByLabelText(/next/i);
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("disables previous button on first page", () => {
    render(<TablePagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
  });

  it("disables next button on last page", () => {
    render(<TablePagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
  });

  it("does not render when there are no pages", () => {
    const { container } = render(<TablePagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />);

    expect(container.firstChild).toBeNull();
  });

  it("does not render when there is only one page", () => {
    const { container } = render(<TablePagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders when loading even with single page", () => {
    render(<TablePagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} isLoading />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} isLoading />);

    const paginationContent = screen.getByText("1").closest("ul");
    expect(paginationContent).toHaveClass("opacity-75");
  });

  it("disables buttons when loading", async () => {
    render(<TablePagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} isLoading />);

    const prevButton = screen.getByLabelText(/previous/i);
    const nextButton = screen.getByLabelText(/next/i);

    // Previous and Next buttons should have disabled styling when loading
    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");

    // The pagination list should have reduced opacity when loading
    const paginationList = prevButton.closest("ul");
    expect(paginationList).toHaveClass("opacity-75");
  });

  it("shows correct pages when current page is near the beginning", () => {
    render(<TablePagination currentPage={2} totalPages={10} onPageChange={mockOnPageChange} />);

    // Should show pages 1-5
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.queryByText("6")).not.toBeInTheDocument();
  });

  it("shows correct pages when current page is near the end", () => {
    render(<TablePagination currentPage={9} totalPages={10} onPageChange={mockOnPageChange} />);

    // Should show pages 6-10
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("shows all pages when total pages is less than max visible", () => {
    render(<TablePagination currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("prevents navigation beyond boundaries", async () => {
    // Test first page - previous button should be disabled
    const { rerender } = render(<TablePagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);

    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");

    // Test last page - next button should be disabled
    rerender(<TablePagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
  });

  it("handles single page scenario", () => {
    render(<TablePagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} isLoading />);

    const prevButton = screen.getByLabelText(/previous/i);
    const nextButton = screen.getByLabelText(/next/i);

    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50", "cursor-not-allowed");
  });
});
