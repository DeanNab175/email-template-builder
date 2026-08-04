import { describe, expect, it } from "vitest";
import { createBlock } from "@/features/rendering/block-factory";
import { findBlockLocation, insertBlock, removeBlock } from "@/lib/utils/tree";

describe("drag and drop tree operations", () => {
  it("inserts blocks into nested drop targets", () => {
    const section = createBlock("section");
    const heading = createBlock("heading");
    const blocks = insertBlock([section], section.id, heading, 0);

    expect(findBlockLocation(blocks, heading.id)).toMatchObject({
      parentId: section.id,
      index: 0,
    });
  });

  it("removes a nested block while preserving its source coordinates", () => {
    const section = createBlock("section");
    const text = createBlock("text");
    const blocks = insertBlock([section], section.id, text);
    const result = removeBlock(blocks, text.id);

    expect(result.block?.id).toBe(text.id);
    expect(result.parentId).toBe(section.id);
    expect(result.index).toBe(0);
    expect(findBlockLocation(result.blocks, text.id)).toBeUndefined();
  });
});
