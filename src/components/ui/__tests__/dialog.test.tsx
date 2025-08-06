import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { render, screen } from "@/test/testUtils";

import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../dialog";

describe("Dialog", () => {
  it("renders dialog with trigger and content", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog content</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    // Dialog should not be visible initially
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();

    // Click trigger to open dialog
    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    // Dialog should now be visible
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Dialog Description")).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("closes dialog when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );

    // Open dialog
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();

    // Close dialog
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
  });

  it("closes dialog when escape key is pressed", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <div>Content</div>
        </DialogContent>
      </Dialog>
    );

    // Open dialog
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();

    // Press escape to close
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
  });

  it("applies correct styling classes", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogHeader data-testid="dialog-header">
            <DialogTitle data-testid="dialog-title">Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">Description</DialogDescription>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const content = screen.getByTestId("dialog-content");
    expect(content).toHaveClass("fixed", "left-[50%]", "top-[50%]", "z-50");

    const header = screen.getByTestId("dialog-header");
    expect(header).toHaveClass("flex", "flex-col", "space-y-1.5");

    const title = screen.getByTestId("dialog-title");
    expect(title).toHaveClass("text-lg", "font-semibold");

    const description = screen.getByTestId("dialog-description");
    expect(description).toHaveClass("text-sm", "text-muted-foreground");

    const footer = screen.getByTestId("dialog-footer");
    expect(footer).toHaveClass("flex", "flex-col-reverse");
  });

  it("supports custom className on components", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">
            <DialogTitle className="custom-title">Title</DialogTitle>
            <DialogDescription className="custom-description">Description</DialogDescription>
          </DialogHeader>
          <DialogFooter className="custom-footer">
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("dialog")).toHaveClass("custom-content");
    expect(screen.getByText("Title").parentElement).toHaveClass("custom-header");
    expect(screen.getByText("Title")).toHaveClass("custom-title");
    expect(screen.getByText("Description")).toHaveClass("custom-description");
    expect(screen.getByRole("button", { name: "Action" }).parentElement).toHaveClass("custom-footer");
  });

  it("handles controlled dialog state", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    // Dialog should not be visible when open=false
    expect(screen.queryByText("Controlled Dialog")).not.toBeInTheDocument();

    // Click trigger should call onOpenChange
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Rerender with open=true
    rerender(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    // Dialog should now be visible
    expect(screen.getByText("Controlled Dialog")).toBeInTheDocument();
  });
});
