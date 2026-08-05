import { beforeEach, describe, expect, it } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmailCanvas } from "@/components/canvas/email-canvas";
import { sampleTemplate } from "@/constants/sample-template";
import { createBlock } from "@/features/rendering/block-factory";
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

  it("lets images fill a full-width section despite their stored width", () => {
    const document = structuredClone(sampleTemplate);
    const section = document.blocks.find(
      (block) => block.id === "section-letter",
    );
    const image = createBlock("image");
    image.props.width = 600;
    section!.props.fullWidth = true;
    section!.children = [image];
    useBuilderStore.setState({ document });

    const { container } = render(
      <DndContext>
        <EmailCanvas />
      </DndContext>,
    );

    expect(screen.getByAltText("A bright modern workspace")).toHaveStyle({
      maxWidth: "100%",
      width: "100%",
    });
    expect(
      container.querySelector(
        '[data-canvas-block-id="section-letter"] > .min-h-18',
      ),
    ).toHaveStyle({ paddingInline: "0" });
  });

  it("exposes section settings when a full-width image covers the section", () => {
    const document = structuredClone(sampleTemplate);
    const section = document.blocks.find(
      (block) => block.id === "section-letter",
    );
    const image = createBlock("image");
    section!.props.fullWidth = true;
    section!.children = [image];
    useBuilderStore.setState({ document });

    render(
      <DndContext>
        <EmailCanvas />
      </DndContext>,
    );

    fireEvent.pointerOver(screen.getByAltText("A bright modern workspace"));
    fireEvent.click(
      screen.getByRole("button", { name: "Edit section settings" }),
    );

    expect(useBuilderStore.getState().selectedBlockId).toBe("section-letter");
  });
});
