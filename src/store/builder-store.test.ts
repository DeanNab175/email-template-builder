import { beforeEach, describe, expect, it } from "vitest";
import { sampleTemplate } from "@/constants/sample-template";
import { createBlock } from "@/features/rendering/block-factory";
import { useBuilderStore } from "@/store/builder-store";

describe("builder store", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      document: structuredClone(sampleTemplate),
      customBlocks: [],
      selectedBlockId: null,
      past: [],
      future: [],
      isDirty: false,
      historyKey: null,
      historyAt: 0,
    });
  });

  it("records additions in history and supports undo/redo", () => {
    const before = useBuilderStore.getState().document.blocks.length;
    useBuilderStore.getState().addBlock("heading");

    expect(useBuilderStore.getState().document.blocks).toHaveLength(before + 1);
    expect(useBuilderStore.getState().past).toHaveLength(1);

    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().document.blocks).toHaveLength(before);

    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().document.blocks).toHaveLength(before + 1);
  });

  it("updates selected block properties in real time", () => {
    useBuilderStore
      .getState()
      .updateBlockProps("heading-letter", { content: "A better headline" });
    const section = useBuilderStore
      .getState()
      .document.blocks.find((block) => block.id === "section-letter");
    const heading = section?.children?.find(
      (block) => block.id === "heading-letter",
    );

    expect(heading?.props.content).toBe("A better headline");
    expect(useBuilderStore.getState().isDirty).toBe(true);
  });

  it("updates the document font settings and supports undo", () => {
    const original = useBuilderStore.getState().document.settings.fontFamily;

    useBuilderStore
      .getState()
      .updateSettings({ fontFamily: "Georgia, 'Times New Roman', serif" });

    expect(useBuilderStore.getState().document.settings.fontFamily).toBe(
      "Georgia, 'Times New Roman', serif",
    );
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().document.settings.fontFamily).toBe(
      original,
    );
  });

  it("reorders a block downward using sortable target indexes", () => {
    const before = useBuilderStore
      .getState()
      .document.blocks.map((block) => block.id);
    useBuilderStore.getState().moveBlock(before[0], null, 1);
    const after = useBuilderStore
      .getState()
      .document.blocks.map((block) => block.id);

    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it("saves and inserts authored custom blocks with fresh nested IDs", () => {
    const customRoot = createBlock("custom");
    customRoot.children = [
      structuredClone(
        useBuilderStore
          .getState()
          .document.blocks.find((block) => block.id === "section-letter")!
          .children![0],
      ),
    ];
    const savedId = useBuilderStore
      .getState()
      .saveCustomBlock("Feature section", "Reusable introduction", customRoot);

    expect(savedId).not.toBeNull();
    expect(useBuilderStore.getState().customBlocks[0].name).toBe(
      "Feature section",
    );

    const insertedId = useBuilderStore
      .getState()
      .addCustomBlock(savedId as string);
    const inserted = useBuilderStore
      .getState()
      .document.blocks.find((block) => block.id === insertedId);

    expect(inserted?.type).toBe("custom");
    expect(inserted?.id).not.toBe(customRoot.id);
    expect(inserted?.children?.[0].id).not.toBe("heading-letter");
  });

  it("removes a custom block without changing the email", () => {
    const blockCount = useBuilderStore.getState().document.blocks.length;
    const customRoot = createBlock("custom");
    const savedId = useBuilderStore
      .getState()
      .saveCustomBlock("Campaign hero", "", customRoot);

    useBuilderStore.getState().deleteCustomBlock(savedId as string);

    expect(useBuilderStore.getState().customBlocks).toHaveLength(0);
    expect(useBuilderStore.getState().document.blocks).toHaveLength(blockCount);
  });
});
