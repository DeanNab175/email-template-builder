import { beforeEach, describe, expect, it } from "vitest";
import { sampleTemplate } from "@/constants/sample-template";
import { useBuilderStore } from "@/store/builder-store";

describe("builder store", () => {
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
});
