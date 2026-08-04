"use client";

import { memo, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { EmailBlockView } from "@/components/canvas/email-block-view";
import { blockRegistry } from "@/features/rendering/block-registry";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/store/builder-store";
import type { EmailBlock } from "@/types";

function DropList({
  blocks,
  parentId,
  className,
}: {
  blocks: EmailBlock[];
  parentId: string | null;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${parentId ?? "root"}`,
    data: { kind: "container", parentId },
  });

  return (
    <SortableContext
      items={blocks.map((block) => block.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "relative min-h-14 transition",
          !blocks.length &&
            "after:absolute after:inset-2 after:flex after:items-center after:justify-center after:rounded-lg after:border after:border-dashed after:border-slate-300 after:text-[10px] after:font-bold after:tracking-widest after:text-slate-400 after:uppercase after:content-['Drop_content_here']",
          isOver && "ring-2 ring-indigo-400 ring-inset",
          className,
        )}
      >
        {blocks.map((block, index) => (
          <CanvasBlock
            key={block.id}
            block={block}
            parentId={parentId}
            index={index}
          />
        ))}
      </div>
    </SortableContext>
  );
}

function StructuralChildren({ block }: { block: EmailBlock }): ReactNode {
  if (!blockRegistry[block.type].acceptsChildren) return undefined;
  if (block.type === "columns") {
    return (
      <SortableContext
        items={(block.children ?? []).map((child) => child.id)}
        strategy={verticalListSortingStrategy}
      >
        {(block.children ?? []).map((child, index) => (
          <CanvasBlock
            key={child.id}
            block={child}
            parentId={block.id}
            index={index}
          />
        ))}
      </SortableContext>
    );
  }
  return <DropList blocks={block.children ?? []} parentId={block.id} />;
}

interface CanvasBlockProps {
  block: EmailBlock;
  parentId: string | null;
  index: number;
}

const CanvasBlock = memo(function CanvasBlock({
  block,
  parentId,
  index,
}: CanvasBlockProps) {
  const selectedBlockId = useBuilderStore((state) => state.selectedBlockId);
  const selectBlock = useBuilderStore((state) => state.selectBlock);
  const deleteBlock = useBuilderStore((state) => state.deleteBlock);
  const duplicateBlock = useBuilderStore((state) => state.duplicateBlock);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: {
      kind: "block",
      blockId: block.id,
      blockType: block.type,
      acceptsChildren: blockRegistry[block.type].acceptsChildren,
      parentId,
      index,
    },
  });
  const selected = selectedBlockId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/block relative cursor-pointer outline-none",
        selected && "z-10 ring-2 ring-indigo-500 ring-inset",
        !selected && "hover:ring-1 hover:ring-indigo-300 hover:ring-inset",
        isDragging && "z-50 opacity-35",
      )}
      {...attributes}
      onClick={(event) => {
        event.stopPropagation();
        selectBlock(block.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") selectBlock(block.id);
        if ((event.key === "Backspace" || event.key === "Delete") && selected)
          deleteBlock(block.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${blockRegistry[block.type].label} block`}
    >
      <div
        className={cn(
          "absolute top-1 left-1/2 z-30 hidden -translate-x-1/2 items-center overflow-hidden rounded-md bg-slate-900 text-white shadow-xl group-hover/block:flex",
          selected && "flex",
        )}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="cursor-grab p-1.5 hover:bg-slate-700 active:cursor-grabbing"
          aria-label={`Drag ${block.type}`}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="border-x border-slate-700 px-2 text-[9px] font-bold tracking-wider uppercase">
          {block.type}
        </span>
        <button
          type="button"
          className="p-1.5 hover:bg-slate-700"
          onClick={() => duplicateBlock(block.id)}
          aria-label="Duplicate block"
        >
          <Copy className="size-3" />
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-rose-600"
          onClick={() => deleteBlock(block.id)}
          aria-label="Delete block"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
      <EmailBlockView block={block}>
        <StructuralChildren block={block} />
      </EmailBlockView>
    </div>
  );
});

export function EmailCanvas() {
  const document = useBuilderStore((state) => state.document);
  const selectedBlockId = useBuilderStore((state) => state.selectedBlockId);
  const selectBlock = useBuilderStore((state) => state.selectBlock);

  return (
    <div
      className="min-h-full px-6 py-8 sm:px-10"
      onClick={() => selectedBlockId && selectBlock(null)}
    >
      <div
        className="mx-auto overflow-hidden bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] transition-[width] duration-300"
        style={{
          maxWidth: document.settings.width,
          fontFamily: document.settings.fontFamily,
        }}
        aria-label="Email design canvas"
      >
        <DropList blocks={document.blocks} parentId={null} />
      </div>
    </div>
  );
}
