import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/builder/theme-toggle";
import { THEME_STORAGE_KEY } from "@/hooks/use-theme";

describe("theme toggle", () => {
  it("switches themes and persists the preference", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
