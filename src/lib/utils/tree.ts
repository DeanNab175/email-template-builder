import { blockRegistry } from "@/features/rendering/block-registry";
import type { BlockLocation, EmailBlock } from "@/types";

export function findBlock(
  blocks: EmailBlock[],
  id: string,
): EmailBlock | undefined {
  for (const block of blocks) {
    if (block.id === id) return block;
    const match = block.children ? findBlock(block.children, id) : undefined;
    if (match) return match;
  }
}

export function findBlockLocation(
  blocks: EmailBlock[],
  id: string,
  parentId: string | null = null,
): BlockLocation | undefined {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === id) return { block, parentId, index };
    const match = block.children
      ? findBlockLocation(block.children, id, block.id)
      : undefined;
    if (match) return match;
  }
}

export function updateBlock(
  blocks: EmailBlock[],
  id: string,
  updater: (block: EmailBlock) => EmailBlock,
): EmailBlock[] {
  return blocks.map((block) => {
    if (block.id === id) return updater(block);
    if (!block.children) return block;
    return { ...block, children: updateBlock(block.children, id, updater) };
  });
}

export function insertBlock(
  blocks: EmailBlock[],
  parentId: string | null,
  block: EmailBlock,
  index?: number,
): EmailBlock[] {
  if (parentId === null) {
    const next = [...blocks];
    next.splice(index ?? next.length, 0, block);
    return next;
  }

  return updateBlock(blocks, parentId, (parent) => {
    if (!blockRegistry[parent.type].acceptsChildren) return parent;
    const children = [...(parent.children ?? [])];
    children.splice(index ?? children.length, 0, block);
    return { ...parent, children };
  });
}

export interface RemovedBlock {
  blocks: EmailBlock[];
  block?: EmailBlock;
  parentId: string | null;
  index: number;
}

export function removeBlock(
  blocks: EmailBlock[],
  id: string,
  parentId: string | null = null,
): RemovedBlock {
  const index = blocks.findIndex((block) => block.id === id);
  if (index >= 0) {
    return {
      blocks: blocks.filter((block) => block.id !== id),
      block: blocks[index],
      parentId,
      index,
    };
  }

  let removed: Omit<RemovedBlock, "blocks"> | undefined;
  const next = blocks.map((block) => {
    if (!block.children || removed) return block;
    const result = removeBlock(block.children, id, block.id);
    if (result.block) {
      removed = {
        block: result.block,
        parentId: result.parentId,
        index: result.index,
      };
      return { ...block, children: result.blocks };
    }
    return block;
  });

  return {
    blocks: next,
    block: removed?.block,
    parentId: removed?.parentId ?? parentId,
    index: removed?.index ?? -1,
  };
}

export function isDescendant(
  block: EmailBlock,
  possibleDescendantId: string,
): boolean {
  return Boolean(
    block.children?.some(
      (child) =>
        child.id === possibleDescendantId ||
        isDescendant(child, possibleDescendantId),
    ),
  );
}

export function cloneBlock(
  block: EmailBlock,
  makeId: (type: string) => string,
): EmailBlock {
  return {
    ...block,
    id: makeId(block.type),
    props: { ...block.props },
    children: block.children?.map((child) => cloneBlock(child, makeId)),
  };
}

export function countBlocks(blocks: EmailBlock[]): number {
  return blocks.reduce(
    (total, block) => total + 1 + countBlocks(block.children ?? []),
    0,
  );
}
