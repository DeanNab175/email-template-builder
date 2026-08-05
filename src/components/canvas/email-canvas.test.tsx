import { beforeEach, describe, expect, it } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmailCanvas } from "@/components/canvas/email-canvas";
import { sampleTemplate } from "@/constants/sample-template";
import { useBuilderStore } from "@/store/builder-store";

describe("email canvas block controls", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      selectedBlockId: null,
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("shows controls only for the innermost hovered block", () => {
    const { container } = render(
      <DndContext>
        <EmailCanvas />
      </DndContext>,
    );
    const section = container.querySelector<HTMLElement>(
      '[data-canvas-block-id="section-letter"]',
    );
    const heading = container.querySelector<HTMLElement>(
      '[data-canvas-block-id="heading-letter"]',
    );
    const sectionToolbar = section?.querySelector<HTMLElement>(
      ':scope > [role="toolbar"]',
    );
    const headingToolbar = heading?.querySelector<HTMLElement>(
      ':scope > [role="toolbar"]',
    );

    expect(sectionToolbar).toHaveClass("hidden");
    expect(sectionToolbar).not.toHaveClass("flex");
    expect(headingToolbar).toHaveClass("hidden");
    expect(headingToolbar).not.toHaveClass("flex");

    fireEvent.pointerOver(section!);
    expect(sectionToolbar).toHaveClass("flex");
    expect(headingToolbar).not.toHaveClass("flex");

    fireEvent.pointerOver(
      screen.getByRole("heading", {
        name: "Built for the work between the work",
      }),
    );
    expect(sectionToolbar).not.toHaveClass("flex");
    expect(headingToolbar).toHaveClass("flex");
  });
});
