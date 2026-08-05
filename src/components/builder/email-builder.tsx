"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { BuilderToolbar } from "@/components/builder/builder-toolbar";
import { EmailCanvas } from "@/components/canvas/email-canvas";
import { PropertyEditor } from "@/components/editor/property-editor";
import { BlockLibrary } from "@/components/sidebar/block-library";
import { blockRegistry } from "@/features/rendering/block-registry";
import { useAutosave } from "@/hooks/use-autosave";
import { useBuilderStore } from "@/store/builder-store";
import type { BlockType } from "@/types";

const EmailPreview = dynamic(
  () =>
    import("@/components/preview/email-preview").then(
      (module) => module.EmailPreview,
    ),
  {
    loading: () => (
      <div className="h-full animate-pulse bg-slate-100 dark:bg-slate-950" />
    ),
  },
);

interface DragData {
  kind?: "palette" | "block" | "container";
  type?: BlockType;
  blockId?: string;
  acceptsChildren?: boolean;
  parentId?: string | null;
  index?: number;
}

export function EmailBuilder() {
  useAutosave();
  const [activeLabel, setActiveLabel] = useState("");
  const surface = useBuilderStore((state) => state.surface);
  const selectedBlockId = useBuilderStore((state) => state.selectedBlockId);
  const addBlock = useBuilderStore((state) => state.addBlock);
  const moveBlock = useBuilderStore((state) => state.moveBlock);
  const deleteBlock = useBuilderStore((state) => state.deleteBlock);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedBlockId
      ) {
        event.preventDefault();
        deleteBlock(selectedBlockId);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [deleteBlock, redo, selectedBlockId, undo]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current as DragData | undefined;
    setActiveLabel(
      data?.type
        ? blockRegistry[data.type].label
        : data?.kind === "block"
          ? "Move block"
          : "Block",
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLabel("");
    if (!over) return;
    const source = active.data.current as DragData | undefined;
    const target = over.data.current as DragData | undefined;
    if (!source || !target) return;

    const nestingIntoTarget = target.kind === "block" && target.acceptsChildren;
    const targetParentId = nestingIntoTarget
      ? (target.blockId ?? null)
      : (target.parentId ?? null);
    const targetIndex =
      target.kind === "block" && !nestingIntoTarget ? target.index : undefined;

    if (source.kind === "palette" && source.type) {
      addBlock(source.type, targetParentId, targetIndex);
    } else if (
      source.kind === "block" &&
      source.blockId &&
      source.blockId !== over.id
    ) {
      moveBlock(source.blockId, targetParentId, targetIndex);
    }
  };

  return (
    <div className="flex h-dvh min-h-[680px] flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <BuilderToolbar />
      <DndContext
        id="email-builder-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveLabel("")}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Press space to pick up a block, use arrow keys to move it, and press space again to drop.",
          },
        }}
      >
        <main className="flex min-h-0 flex-1">
          {surface === "design" && <BlockLibrary />}
          <section
            className="builder-grid min-w-0 flex-1 overflow-auto bg-slate-100 dark:bg-slate-950"
            aria-label={surface === "design" ? "Email editor" : "Email preview"}
          >
            {surface === "design" ? <EmailCanvas /> : <EmailPreview />}
          </section>
          {surface === "design" && <PropertyEditor />}
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
