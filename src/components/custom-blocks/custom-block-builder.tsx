"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  ArrowLeft,
  Blocks,
  Box,
  Columns3,
  GalleryHorizontalEnd,
  GripVertical,
  Heading,
  ImageIcon,
  LayoutPanelTop,
  Minus,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  Save,
  Search,
  Share2,
  Trash2,
  Type,
  type LucideIcon,
} from "lucide-react";
import { CustomBlockCanvas } from "@/components/custom-blocks/custom-block-canvas";
import { CustomBlockProperties } from "@/components/custom-blocks/custom-block-properties";
import { ThemeToggle } from "@/components/builder/theme-toggle";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, Textarea } from "@/components/ui/field";
import { createBlock } from "@/features/rendering/block-factory";
import {
  blockDefinitions,
  blockRegistry,
} from "@/features/rendering/block-registry";
import { cn } from "@/lib/utils/cn";
import { createId } from "@/lib/utils/id";
import {
  cloneBlock,
  countBlocks,
  findBlock,
  findBlockLocation,
  insertBlock,
  isDescendant,
  removeBlock,
  updateBlock,
} from "@/lib/utils/tree";
import { blockSchemas } from "@/schemas";
import { useBuilderStore } from "@/store/builder-store";
import type { BlockProps, BlockType, CustomBlock, EmailBlock } from "@/types";

interface DraftDragData {
  kind?: "draft-palette" | "draft-block" | "draft-container";
  type?: BlockType;
  blockId?: string;
  acceptsChildren?: boolean;
  parentId?: string;
  index?: number;
}

const blockIcons: Record<BlockType, LucideIcon> = {
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

const studioBlockDefinitions = blockDefinitions.filter(
  (definition) =>
    !(["hero", "social", "footer"] as BlockType[]).includes(definition.type),
);

function createDraftRoot() {
  const root = createBlock("custom");
  root.props.name = "Untitled custom block";
  return root;
}

function validateTree(block: EmailBlock): boolean {
  if (!blockSchemas[block.type].safeParse(block.props).success) return false;
  return (block.children ?? []).every(validateTree);
}

function PaletteItem({
  type,
  onAdd,
}: {
  type: BlockType;
  onAdd: (type: BlockType) => void;
}) {
  const definition = blockRegistry[type];
  const Icon = blockIcons[type];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draft-palette-${type}`,
    data: { kind: "draft-palette", type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn(
        "group flex w-full cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600",
        isDragging && "opacity-35",
      )}
      onClick={() => onAdd(type)}
      aria-label={`Add ${definition.label} to custom block`}
      {...listeners}
      {...attributes}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">
          {definition.label}
        </span>
        <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
          {definition.description}
        </span>
      </span>
    </button>
  );
}

function CustomBlockPalette({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      studioBlockDefinitions.filter((definition) =>
        `${definition.label} ${definition.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Building blocks
        </h2>
        <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
          Click to add inside the selected container, or drag to an exact spot.
        </p>
        <label className="relative mt-3 block">
          <span className="sr-only">Search building blocks</span>
          <Search className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-xs outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Search blocks"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {filtered.map((definition) => (
          <PaletteItem
            key={definition.type}
            type={definition.type}
            onAdd={onAdd}
          />
        ))}
        {!filtered.length && (
          <p className="py-8 text-center text-xs text-slate-500">
            No blocks found.
          </p>
        )}
      </div>
    </aside>
  );
}

export function CustomBlockBuilder({
  initialBlockId,
}: {
  initialBlockId?: string;
}) {
  const customBlocks = useBuilderStore((state) => state.customBlocks);
  const hasHydrated = useBuilderStore((state) => state.hasHydrated);
  const initialBlock = initialBlockId
    ? customBlocks.find((candidate) => candidate.id === initialBlockId)
    : undefined;

  if (initialBlockId && !hasHydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-100 text-sm font-medium text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Loading custom block…
      </div>
    );
  }

  return (
    <CustomBlockEditor
      key={initialBlockId ?? "new-custom-block"}
      initialBlock={initialBlock}
      editNotFound={Boolean(initialBlockId && !initialBlock)}
    />
  );
}

function CustomBlockEditor({
  initialBlock,
  editNotFound,
}: {
  initialBlock?: CustomBlock;
  editNotFound: boolean;
}) {
  const router = useRouter();
  const saveCustomBlock = useBuilderStore((state) => state.saveCustomBlock);
  const [root, setRoot] = useState(() =>
    initialBlock ? structuredClone(initialBlock.block) : createDraftRoot(),
  );
  const [selectedId, setSelectedId] = useState(root.id);
  const [name, setName] = useState(
    initialBlock?.name ?? "Untitled custom block",
  );
  const [description, setDescription] = useState(
    initialBlock?.description ?? "",
  );
  const [savedId, setSavedId] = useState<string | null>(
    initialBlock?.id ?? null,
  );
  const [status, setStatus] = useState(
    editNotFound
      ? "The custom block you wanted to edit could not be found."
      : "",
  );
  const [activeLabel, setActiveLabel] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const selectedBlock = findBlock([root], selectedId) ?? root;
  const contentCount = Math.max(0, countBlocks(root.children ?? []));

  const addAt = useCallback(
    (type: BlockType, parentId: string, index?: number) => {
      const block = createBlock(type);
      setRoot(
        (current) =>
          insertBlock([current], parentId, block, index)[0] ?? current,
      );
      setSelectedId(block.id);
      setStatus("");
    },
    [],
  );

  const addFromPalette = useCallback(
    (type: BlockType) => {
      const target = findBlock([root], selectedId);
      const parentId =
        target &&
        target.type !== "columns" &&
        blockRegistry[target.type].acceptsChildren
          ? target.id
          : root.id;
      addAt(type, parentId);
    },
    [addAt, root, selectedId],
  );

  const updateProps = useCallback((id: string, props: BlockProps) => {
    setRoot((current) => {
      const updated = updateBlock([current], id, (block) => {
        const next = { ...block, props: { ...block.props, ...props } };
        if (block.type !== "columns") return next;

        const count = Number(next.props.columnCount);
        const children = [...(next.children ?? [])];
        while (children.length < count) children.push(createBlock("container"));
        return { ...next, children: children.slice(0, count) };
      });
      return updated[0] ?? current;
    });
    setStatus("");
  }, []);

  const deleteDraftBlock = useCallback(
    (id: string) => {
      setRoot((current) => {
        if (id === current.id) return current;
        const result = removeBlock([current], id);
        return result.blocks[0] ?? current;
      });
      setSelectedId((current) => (current === id ? root.id : current));
      setStatus("");
    },
    [root.id],
  );

  const duplicateDraftBlock = useCallback(
    (id: string) => {
      const location = findBlockLocation([root], id);
      if (!location || location.parentId === null) return;
      const duplicate = cloneBlock(location.block, (type) => createId(type));
      setRoot(
        (current) =>
          insertBlock(
            [current],
            location.parentId,
            duplicate,
            location.index + 1,
          )[0] ?? current,
      );
      setSelectedId(duplicate.id);
      setStatus("");
    },
    [root],
  );

  const moveDraftBlock = useCallback(
    (id: string, parentId: string, index?: number) => {
      setRoot((current) => {
        const source = findBlockLocation([current], id);
        const parent = findBlock([current], parentId);
        if (
          !source ||
          !parent ||
          parent.type === "columns" ||
          !blockRegistry[parent.type].acceptsChildren ||
          parent.id === id ||
          isDescendant(source.block, parentId)
        )
          return current;

        const removed = removeBlock([current], id);
        if (!removed.block) return current;
        return (
          insertBlock(removed.blocks, parentId, removed.block, index)[0] ??
          current
        );
      });
      setSelectedId(id);
      setStatus("");
    },
    [],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current as DraftDragData | undefined;
    setActiveLabel(
      data?.type
        ? blockRegistry[data.type].label
        : data?.kind === "draft-block"
          ? "Move block"
          : "Block",
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLabel("");
    if (!over) return;
    const source = active.data.current as DraftDragData | undefined;
    const target = over.data.current as DraftDragData | undefined;
    if (!source || !target) return;

    const nestingIntoTarget =
      target.kind === "draft-block" && target.acceptsChildren;
    const parentId = nestingIntoTarget ? target.blockId : target.parentId;
    if (!parentId) return;
    const index =
      target.kind === "draft-block" && !nestingIntoTarget
        ? target.index
        : undefined;

    if (source.kind === "draft-palette" && source.type) {
      addAt(source.type, parentId, index);
    } else if (
      source.kind === "draft-block" &&
      source.blockId &&
      source.blockId !== over.id
    ) {
      moveDraftBlock(source.blockId, parentId, index);
    }
  };

  const save = (returnToBuilder: boolean) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus("Give the custom block a name before saving.");
      return;
    }
    if (!root.children?.length) {
      setStatus("Add at least one building block before saving.");
      return;
    }

    const block = {
      ...structuredClone(root),
      props: { ...root.props, name: trimmedName },
    };
    if (!validateTree(block)) {
      setStatus("Fix the invalid property fields before saving this block.");
      return;
    }

    const id = saveCustomBlock(trimmedName, description, block, savedId);
    if (!id) {
      setStatus("The custom block could not be saved.");
      return;
    }
    setSavedId(id);
    setStatus(`Saved “${trimmedName}” to Your blocks.`);
    if (returnToBuilder) router.push("/builder");
  };

  const clearDraft = () => {
    if (
      contentCount > 0 &&
      !window.confirm("Clear this custom block and start again?")
    )
      return;
    const next = createDraftRoot();
    setRoot(next);
    setSelectedId(next.id);
    setName("Untitled custom block");
    setDescription("");
    setSavedId(null);
    setStatus("");
  };

  return (
    <div className="flex h-dvh min-h-[720px] flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <header className="relative z-40 flex min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Link
          href="/builder"
          className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Back to email builder"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-indigo-600 text-white shadow-sm">
          <Blocks className="size-4" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
            Custom Block Studio
          </h1>
          <p className="text-[9px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            {contentCount} {contentCount === 1 ? "element" : "elements"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" variant="ghost" onClick={clearDraft}>
            <Trash2 className="size-3.5" /> Clear
          </Button>
          <Button size="sm" onClick={() => save(false)}>
            <Save className="size-3.5" /> Save
          </Button>
          <Button size="sm" variant="primary" onClick={() => save(true)}>
            Save &amp; return
          </Button>
        </div>
      </header>

      <section className="grid shrink-0 grid-cols-[minmax(220px,1fr)_minmax(260px,1.5fr)] gap-4 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div>
          <FieldLabel htmlFor="custom-block-title">Block name</FieldLabel>
          <Input
            id="custom-block-title"
            value={name}
            maxLength={80}
            onChange={(event) => {
              setName(event.target.value);
              setStatus("");
            }}
          />
        </div>
        <div>
          <FieldLabel htmlFor="custom-block-description">
            Description
          </FieldLabel>
          <Textarea
            id="custom-block-description"
            value={description}
            maxLength={160}
            rows={1}
            className="min-h-10 resize-none py-2"
            placeholder="What should this block be used for?"
            onChange={(event) => {
              setDescription(event.target.value);
              setStatus("");
            }}
          />
        </div>
        {status && (
          <p
            className={cn(
              "col-span-2 -mt-1 text-[11px] font-medium",
              status.startsWith("Saved")
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
            role="status"
          >
            {status}
          </p>
        )}
      </section>

      <DndContext
        id="custom-block-studio-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveLabel("")}
        onDragEnd={handleDragEnd}
      >
        <main className="flex min-h-0 flex-1">
          <CustomBlockPalette onAdd={addFromPalette} />
          <section
            className="min-w-0 flex-1 overflow-auto"
            aria-label="Custom block canvas"
          >
            <CustomBlockCanvas
              root={root}
              selectedId={selectedBlock.id}
              onSelect={setSelectedId}
              onDuplicate={duplicateDraftBlock}
              onDelete={deleteDraftBlock}
            />
          </section>
          <CustomBlockProperties
            block={selectedBlock}
            isRoot={selectedBlock.id === root.id}
            onUpdate={updateProps}
            onDuplicate={duplicateDraftBlock}
            onDelete={deleteDraftBlock}
          />
        </main>
        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeLabel ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xl">
              <GripVertical className="size-3.5" /> {activeLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
