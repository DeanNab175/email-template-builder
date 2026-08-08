"use client";

import { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { EmailBlockView } from "@/components/canvas/email-block-view";
import { blockRegistry } from "@/features/rendering/block-registry";
import { cn } from "@/lib/utils/cn";
import type { EmailBlock } from "@/types";

interface CustomBlockCanvasProps {
  root: EmailBlock;
  selectedId: string;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

interface DraftBlockProps extends Omit<CustomBlockCanvasProps, "root"> {
  block: EmailBlock;
  parentId: string;
  index: number;
}

function DraftDropList({
  blocks,
  parentId,
  selectedId,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  blocks: EmailBlock[];
  parentId: string;
} & Omit<CustomBlockCanvasProps, "root">) {
  const { setNodeRef, isOver } = useDroppable({
    id: `draft-drop-${parentId}`,
    data: { kind: "draft-container", parentId },
  });

  return (
    <SortableContext
      items={blocks.map((block) => block.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "relative min-h-16 transition",
          !blocks.length &&
            "after:absolute after:inset-2 after:flex after:items-center after:justify-center after:rounded-lg after:border after:border-dashed after:border-slate-300 after:text-[10px] after:font-bold after:tracking-widest after:text-slate-400 after:uppercase after:content-['Drop_blocks_here']",
          isOver && "ring-2 ring-indigo-400 ring-inset",
        )}
      >
        {blocks.map((block, index) => (
          <DraftBlock
            key={block.id}
            block={block}
            parentId={parentId}
            index={index}
            selectedId={selectedId}
            onSelect={onSelect}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </SortableContext>
  );
}

function DraftChildren({
  block,
  ...actions
}: {
  block: EmailBlock;
} & Omit<CustomBlockCanvasProps, "root">): ReactNode {
  if (!blockRegistry[block.type].acceptsChildren) return undefined;

  if (block.type === "columns") {
    return (
      <SortableContext
        items={(block.children ?? []).map((child) => child.id)}
        strategy={verticalListSortingStrategy}
      >
        {(block.children ?? []).map((child, index) => (
          <DraftBlock
            key={child.id}
            block={child}
            parentId={block.id}
            index={index}
            {...actions}
          />
        ))}
      </SortableContext>
    );
  }

  return (
    <DraftDropList
      blocks={block.children ?? []}
      parentId={block.id}
      {...actions}
    />
  );
}

function DraftBlock({
  block,
  parentId,
  index,
  selectedId,
  onSelect,
  onDuplicate,
  onDelete,
}: DraftBlockProps) {
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
      kind: "draft-block",
      blockId: block.id,
      acceptsChildren:
        block.type !== "columns" && blockRegistry[block.type].acceptsChildren,
      parentId,
      index,
    },
  });
  const selected = selectedId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative cursor-pointer outline-none",
        selected && "z-10 ring-2 ring-indigo-500 ring-inset",
        !selected && "hover:ring-1 hover:ring-indigo-300 hover:ring-inset",
        isDragging && "z-50 opacity-35",
      )}
      {...attributes}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(block.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(block.id);
        if (event.key === "Delete" || event.key === "Backspace")
          onDelete(block.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Edit ${blockRegistry[block.type].label}`}
    >
      <div className="absolute top-1 left-1/2 z-30 hidden -translate-x-1/2 items-center overflow-hidden rounded-md bg-slate-900 text-white shadow-xl group-focus-within:flex group-hover:flex">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="cursor-grab p-1.5 hover:bg-slate-700 active:cursor-grabbing"
          aria-label={`Drag ${blockRegistry[block.type].label}`}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="border-x border-slate-700 px-2 text-[9px] font-bold tracking-wider uppercase">
          {blockRegistry[block.type].label}
        </span>
        <button
          type="button"
          className="p-1.5 hover:bg-slate-700"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate(block.id);
          }}
          aria-label="Duplicate draft block"
        >
          <Copy className="size-3" />
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-rose-600"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(block.id);
          }}
          aria-label="Delete draft block"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
      <EmailBlockView block={block}>
        <DraftChildren
          block={block}
          selectedId={selectedId}
          onSelect={onSelect}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </EmailBlockView>
    </div>
  );
}

export function CustomBlockCanvas({
  root,
  selectedId,
  onSelect,
  onDuplicate,
  onDelete,
}: CustomBlockCanvasProps) {
  const selected = selectedId === root.id;

  return (
    <div
      className="builder-grid min-h-full px-8 py-10"
      onClick={() => onSelect(root.id)}
    >
      <div className="mx-auto max-w-160">
        <div className="mb-3 flex items-center justify-between text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
          <span>640 px email block</span>
          <span>Click any element to edit</span>
        </div>
        <div
          className={cn(
            "relative overflow-hidden bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.28)] outline-none",
            selected && "ring-2 ring-indigo-500 ring-offset-4",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(root.id);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onSelect(root.id);
          }}
          role="button"
          tabIndex={0}
          aria-label="Edit custom block wrapper"
        >
          <EmailBlockView block={root}>
            <DraftDropList
              blocks={root.children ?? []}
              parentId={root.id}
              selectedId={selectedId}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </EmailBlockView>
        </div>
      </div>
    </div>
  );
}
