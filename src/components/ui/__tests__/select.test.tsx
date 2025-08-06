import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { render, screen } from "@/test/testUtils";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select";

describe("Select", () => {
  it("renders select with trigger and placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Select an option");
  });

  it("opens dropdown when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option 2" })).toBeInTheDocument();
  });

  it("selects option when clicked", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const option1 = screen.getByRole("option", { name: "Option 1" });
    await user.click(option1);

    expect(onValueChange).toHaveBeenCalledWith("option1");
    expect(trigger).toHaveTextContent("Option 1");
  });

  it("displays default value", () => {
    render(
      <Select defaultValue="option2">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Option 2");
  });

  it("renders groups and labels", async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectSeparator />
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Group 2</SelectLabel>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByText("Group 2")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option 3" })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select disabled onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-disabled", "");
    expect(trigger).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");

    await user.click(trigger);
    expect(screen.queryByRole("option", { name: "Option 1" })).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("applies custom className to components", async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="custom-content">
          <SelectGroup>
            <SelectLabel className="custom-label">Group</SelectLabel>
            <SelectItem value="option1" className="custom-item">
              Option 1
            </SelectItem>
            <SelectSeparator className="custom-separator" />
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("custom-trigger");

    await user.click(trigger);

    expect(screen.getByText("Group")).toHaveClass("custom-label");
    expect(screen.getByRole("option", { name: "Option 1" })).toHaveClass("custom-item");
  });

  it("handles keyboard navigation", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    // Navigate with arrow keys
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("option2");
  });

  it("closes on escape key", async () => {
    const user = userEvent.setup();

    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("option", { name: "Option 1" })).not.toBeInTheDocument();
  });

  it("supports controlled value", () => {
    const { rerender } = render(
      <Select value="option1">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    let trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Option 1");

    rerender(
      <Select value="option2">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Option 2");
  });
});
