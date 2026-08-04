import { blockRegistry } from "@/features/rendering/block-registry";
import { createId } from "@/lib/utils/id";
import type { BlockType, EmailBlock } from "@/types";

export function createBlock(type: BlockType): EmailBlock {
  const definition = blockRegistry[type];
  const block: EmailBlock = {
    id: createId(type),
    type,
    props: { ...definition.defaultProps },
  };

  if (type === "columns") {
    block.children = [createColumn(), createColumn()];
  } else if (definition.acceptsChildren) {
    block.children = [];
  }

  return block;
}

function createColumn(): EmailBlock {
  return {
    id: createId("column"),
    type: "container",
    props: { backgroundColor: "#ffffff", padding: 16 },
    children: [],
  };
}
