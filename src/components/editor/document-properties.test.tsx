import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentProperties } from "@/components/editor/document-properties";
import { sampleTemplate } from "@/constants/sample-template";
import { useBuilderStore } from "@/store/builder-store";

describe("document font settings", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("applies a font preset", async () => {
    const user = userEvent.setup();
    render(<DocumentProperties />);

    await user.selectOptions(
      screen.getByLabelText("Font family"),
      "Georgia, 'Times New Roman', serif",
    );

    expect(useBuilderStore.getState().document.settings.fontFamily).toBe(
      "Georgia, 'Times New Roman', serif",
    );
  });

  it("selects a Google Font with an email-safe fallback", async () => {
    const user = userEvent.setup();
    render(<DocumentProperties />);

    await user.selectOptions(
      screen.getByLabelText("Font family"),
      "'Roboto', Arial, sans-serif",
    );

    expect(useBuilderStore.getState().document.settings.fontFamily).toBe(
      "'Roboto', Arial, sans-serif",
    );
  });

  it("adds a custom font stack", async () => {
    const user = userEvent.setup();
    render(<DocumentProperties />);

    await user.selectOptions(
      screen.getByLabelText("Font family"),
      "__custom__",
    );
    await user.type(
      screen.getByLabelText("Add custom font stack"),
      "'Inter', Arial, sans-serif",
    );
    await user.click(screen.getByRole("button", { name: "Add custom font" }));

    expect(useBuilderStore.getState().document.settings.fontFamily).toBe(
      "'Inter', Arial, sans-serif",
    );
  });
});
