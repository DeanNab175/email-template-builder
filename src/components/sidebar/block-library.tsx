"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import {
  Box,
  Blocks,
  Columns3,
  GalleryHorizontalEnd,
  Heading,
  ImageIcon,
  LayoutPanelTop,
  Minus,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  Plus,
  Search,
  Share2,
  Trash2,
  Type,
} from "lucide-react";
import {
  blockDefinitions,
  blockRegistry,
} from "@/features/rendering/block-registry";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/store/builder-store";
import type { BlockDefinition, BlockType, CustomBlock } from "@/types";

const icons: Record<BlockType, ComponentType<{ className?: string }>> = {
  section: LayoutPanelTop,
  container: Box,
  text: Type,
  heading: Heading,
  button: MousePointerClick,
  image: ImageIcon,
  divider: Minus,
  spacer: MoveVertical,
  columns: Columns3,
  custom: Blocks,
  hero: GalleryHorizontalEnd,
  social: Share2,
  footer: PanelBottom,
};

function LibraryItem({ definition }: { definition: BlockDefinition }) {
  const addBlock = useBuilderStore((state) => state.addBlock);
  const Icon = icons[definition.type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { kind: "palette", type: definition.type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => addBlock(definition.type)}
      className={cn(
        "group flex min-h-21 cursor-grab flex-col items-start rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500",
        isDragging && "opacity-35",
      )}
      aria-label={`Add ${definition.label}`}
      {...listeners}
      {...attributes}
    >
      <span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
        <Icon className="size-4" />
      </span>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
        {definition.label}
      </span>
      <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
        {definition.description}
      </span>
    </button>
  );
}

function CustomLibraryItem({ customBlock }: { customBlock: CustomBlock }) {
  const addCustomBlock = useBuilderStore((state) => state.addCustomBlock);
  const deleteCustomBlock = useBuilderStore((state) => state.deleteCustomBlock);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `custom-${customBlock.id}`,
    data: {
      kind: "custom",
      customBlockId: customBlock.id,
      label: customBlock.name,
    },
  });

  return (
    <div className="group relative">
      <button
        ref={setNodeRef}
        type="button"
        onClick={() => addCustomBlock(customBlock.id)}
        className={cn(
          "flex min-h-21 w-full cursor-grab flex-col items-start rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md active:cursor-grabbing dark:border-indigo-900 dark:bg-indigo-950/30 dark:hover:border-indigo-600",
          isDragging && "opacity-35",
        )}
        aria-label={`Add custom block ${customBlock.name}`}
        {...listeners}
        {...attributes}
      >
        <span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
          <Blocks className="size-4" />
        </span>
        <span
          className="line-clamp-1 max-w-[72px] text-xs font-bold text-slate-800 dark:text-slate-100"
          title={customBlock.name}
        >
          {customBlock.name}
        </span>
        <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
          {customBlock.description || "Custom reusable block"}
        </span>
      </button>
      <button
        type="button"
        className="absolute top-2 right-2 hidden size-6 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm group-hover:flex hover:bg-rose-50 hover:text-rose-600 focus:flex dark:bg-slate-900 dark:hover:bg-rose-950"
        onClick={() => {
          if (window.confirm(`Delete “${customBlock.name}” from your blocks?`))
            deleteCustomBlock(customBlock.id);
        }}
        aria-label={`Delete custom block ${customBlock.name}`}
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}

export function BlockLibrary() {
  const [search, setSearch] = useState("");
  const customBlocks = useBuilderStore((state) => state.customBlocks);
  const filtered = useMemo(
    () =>
      blockDefinitions.filter((definition) =>
        `${definition.label} ${definition.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  const filteredCustomBlocks = useMemo(
    () =>
      customBlocks.filter((customBlock) =>
        `${customBlock.name} ${customBlock.description} ${blockRegistry[customBlock.block.type].label}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [customBlocks, search],
  );

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/95"
      aria-label="Content blocks"
    >
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Content
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Drag a block into your email.
        </p>
        <label className="relative mt-3 block">
          <span className="sr-only">Search blocks</span>
          <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950"
            placeholder="Search blocks"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {(["Structure", "Content", "Marketing"] as const).map((category) => {
          const items = filtered.filter(
            (definition) => definition.category === category,
          );
          const customItems =
            category === "Marketing" ? filteredCustomBlocks : [];
          if (!items.length && !customItems.length) return null;
          return (
            <section key={category} className="mb-5">
              <h3 className="mb-2 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {items.map((definition) => (
                  <LibraryItem key={definition.type} definition={definition} />
                ))}
                {category === "Marketing" && !search && (
                  <Link
                    href="/blocks"
                    className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-300 px-3 py-2 text-[10px] font-bold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                  >
                    <Plus className="size-3" /> Build a custom block
                  </Link>
                )}
                {category === "Marketing" && customItems.length > 0 && (
                  <p className="col-span-2 mt-2 text-[10px] font-bold tracking-[0.12em] text-indigo-500 uppercase">
                    Your blocks
                  </p>
                )}
                {customItems.map((customBlock) => (
                  <CustomLibraryItem
                    key={customBlock.id}
                    customBlock={customBlock}
                  />
                ))}
                {category === "Marketing" &&
                  !customBlocks.length &&
                  !search && (
                    <p className="col-span-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[10px] leading-4 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Blocks saved in Block Studio will appear here.
                    </p>
                  )}
              </div>
            </section>
          );
        })}
        {!filtered.length && !filteredCustomBlocks.length && (
          <p className="py-8 text-center text-xs text-slate-500">
            No blocks found.
          </p>
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-3 text-[10px] leading-4 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Tip: sections and containers accept nested blocks.
      </div>
    </aside>
  );
}
