import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { render, screen } from "@/test/testUtils";

import { Input } from "../input";

describe("Input", () => {
  it("renders with default props", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("flex", "h-10", "w-full", "rounded-md", "border");
  });

  it("handles text input", async () => {
    const user = userEvent.setup();

    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("handles onChange events", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalledTimes(4); // Once for each character
  });

  it("supports different input types", () => {
    const { rerender } = render(<Input type="email" />);

    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    input = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input type="number" />);
    input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("applies placeholder correctly", () => {
    render(<Input placeholder="Search..." />);

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toHaveAttribute("placeholder", "Search...");
    expect(input).toHaveClass("placeholder:text-muted-foreground");
  });

  it("is disabled when disabled prop is true", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input disabled onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");

    await user.type(input, "test");
    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();

    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("supports all HTML input attributes", () => {
    render(
      <Input
        id="test-input"
        name="testName"
        value="test value"
        maxLength={10}
        required
        data-testid="custom-input"
        readOnly
      />
    );

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("id", "test-input");
    expect(input).toHaveAttribute("name", "testName");
    expect(input).toHaveValue("test value");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("readOnly");
  });

  it("handles focus and blur events", async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("applies focus styles correctly", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2"
    );
  });
});
