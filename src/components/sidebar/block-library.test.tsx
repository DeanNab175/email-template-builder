import { beforeEach, describe, expect, it } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { BlockLibrary } from "@/components/sidebar/block-library";
import { sampleTemplate } from "@/constants/sample-template";
import { createBlock } from "@/features/rendering/block-factory";
import { useBuilderStore } from "@/store/builder-store";

describe("custom block library", () => {
  beforeEach(() => {
    const customBlock = createBlock("custom");
    customBlock.children = [structuredClone(sampleTemplate.blocks[0])];
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      customBlocks: [
        {
          id: "custom-campaign-hero",
          name: "Campaign hero",
          description: "A reusable campaign opener",
          block: customBlock,
          createdAt: "2026-08-08T08:00:00.000Z",
        },
      ],
      selectedBlockId: null,
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("lists and inserts a saved custom block", () => {
    const before = useBuilderStore.getState().document.blocks.length;
    render(
      <DndContext>
        <BlockLibrary />
      </DndContext>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add custom block Campaign hero" }),
    );

    expect(useBuilderStore.getState().document.blocks).toHaveLength(before + 1);
    expect(useBuilderStore.getState().document.blocks.at(-1)).toMatchObject({
      type: "custom",
      children: [
        { type: "hero", props: { title: "Make room for what matters." } },
      ],
    });
  });
});
