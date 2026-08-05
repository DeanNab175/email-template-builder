"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { sampleTemplate } from "@/constants/sample-template";
import { createBlock } from "@/features/rendering/block-factory";
import { blockRegistry } from "@/features/rendering/block-registry";
import { createId } from "@/lib/utils/id";
import {
  cloneBlock,
  findBlock,
  findBlockLocation,
  insertBlock,
  isDescendant,
  removeBlock,
  updateBlock,
} from "@/lib/utils/tree";
import type {
  BlockProps,
  BlockType,
  BuilderSurface,
  EmailClient,
  EmailDocument,
  EmailSettings,
  PreviewMode,
} from "@/types";

const HISTORY_LIMIT = 60;
const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface BuilderState {
  document: EmailDocument;
  selectedBlockId: string | null;
  past: EmailDocument[];
  future: EmailDocument[];
  isDirty: boolean;
  lastSavedAt: string | null;
  historyKey: string | null;
  historyAt: number;
  previewMode: PreviewMode;
  emailClient: EmailClient;
  surface: BuilderSurface;
  hasHydrated: boolean;
  selectBlock: (id: string | null) => void;
  addBlock: (
    type: BlockType,
    parentId?: string | null,
    index?: number,
  ) => string;
  moveBlock: (id: string, parentId: string | null, index?: number) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  updateBlockProps: (id: string, props: BlockProps) => void;
  updateDocument: (
    values: Partial<
      Pick<EmailDocument, "name" | "subject" | "preheader" | "status">
    >,
  ) => void;
  updateSettings: (values: Partial<EmailSettings>) => void;
  loadDocument: (document: EmailDocument) => void;
  newDocument: () => void;
  undo: () => void;
  redo: () => void;
  markSaved: (savedAt?: string) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setEmailClient: (client: EmailClient) => void;
  setSurface: (surface: BuilderSurface) => void;
  setHasHydrated: (value: boolean) => void;
}

const cloneDocument = (document: EmailDocument): EmailDocument =>
  structuredClone(document);

function nextDocument(
  document: EmailDocument,
  blocks: EmailDocument["blocks"],
): EmailDocument {
  return {
    ...document,
    blocks,
    version: document.version + 1,
    updatedAt: new Date().toISOString(),
  };
}

function historyMutation(
  state: BuilderState,
  mutate: (document: EmailDocument) => EmailDocument,
  key?: string,
): Partial<BuilderState> {
  const next = mutate(state.document);
  if (next === state.document) return {};
  const now = Date.now();
  const coalesce = Boolean(
    key && state.historyKey === key && now - state.historyAt < 700,
  );
  return {
    document: next,
    past: coalesce
      ? state.past
      : [
          ...state.past.slice(-(HISTORY_LIMIT - 1)),
          cloneDocument(state.document),
        ],
    future: [],
    isDirty: true,
    historyKey: key ?? null,
    historyAt: now,
  };
}

function makeBlankDocument(): EmailDocument {
  const now = new Date().toISOString();
  return {
    ...cloneDocument(sampleTemplate),
    id: createId("template"),
    name: "Untitled campaign",
    subject: "",
    preheader: "",
    status: "draft",
    version: 1,
    createdAt: now,
    updatedAt: now,
    blocks: [],
  };
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      document: cloneDocument(sampleTemplate),
      selectedBlockId: null,
      past: [],
      future: [],
      isDirty: false,
      lastSavedAt: null,
      historyKey: null,
      historyAt: 0,
      previewMode: "desktop",
      emailClient: "gmail",
      surface: "design",
      hasHydrated: false,

      selectBlock: (id) => set({ selectedBlockId: id }),

      addBlock: (type, parentId = null, index) => {
        const block = createBlock(type);
        set((state) =>
          historyMutation(state, (document) =>
            nextDocument(
              document,
              insertBlock(document.blocks, parentId, block, index),
            ),
          ),
        );
        set({ selectedBlockId: block.id });
        return block.id;
      },

      moveBlock: (id, targetParentId, index) =>
        set((state) =>
          historyMutation(
            state,
            (document) => {
              const source = findBlockLocation(document.blocks, id);
              if (!source) return document;

              if (targetParentId) {
                const parent = findBlock(document.blocks, targetParentId);
                if (
                  !parent ||
                  !blockRegistry[parent.type].acceptsChildren ||
                  isDescendant(source.block, targetParentId) ||
                  parent.id === id
                )
                  return document;
              }

              const removed = removeBlock(document.blocks, id);
              if (!removed.block) return document;
              return nextDocument(
                document,
                insertBlock(
                  removed.blocks,
                  targetParentId,
                  removed.block,
                  index,
                ),
              );
            },
            `property:${id}`,
          ),
        ),

      deleteBlock: (id) =>
        set((state) => {
          const change = historyMutation(state, (document) => {
            const result = removeBlock(document.blocks, id);
            return result.block
              ? nextDocument(document, result.blocks)
              : document;
          });
          return {
            ...change,
            selectedBlockId:
              state.selectedBlockId === id ? null : state.selectedBlockId,
          };
        }),

      duplicateBlock: (id) =>
        set((state) =>
          historyMutation(state, (document) => {
            const location = findBlockLocation(document.blocks, id);
            if (!location) return document;
            const duplicate = cloneBlock(location.block, (type) =>
              createId(type),
            );
            return nextDocument(
              document,
              insertBlock(
                document.blocks,
                location.parentId,
                duplicate,
                location.index + 1,
              ),
            );
          }),
        ),

      updateBlockProps: (id, props) =>
        set((state) =>
          historyMutation(state, (document) => {
            if (!findBlock(document.blocks, id)) return document;
            const blocks = updateBlock(document.blocks, id, (block) => {
              const updated = { ...block, props: { ...block.props, ...props } };
              if (block.type !== "columns") return updated;

              const count = Number(updated.props.columnCount);
              const children = [...(updated.children ?? [])];
              while (children.length < count)
                children.push(createBlock("container"));
              return { ...updated, children: children.slice(0, count) };
            });
            return nextDocument(document, blocks);
          }),
        ),

      updateDocument: (values) =>
        set((state) =>
          historyMutation(
            state,
            (document) => ({
              ...document,
              ...values,
              version: document.version + 1,
              updatedAt: new Date().toISOString(),
            }),
            `document:${Object.keys(values).sort().join(",")}`,
          ),
        ),

      updateSettings: (values) =>
        set((state) =>
          historyMutation(
            state,
            (document) => ({
              ...document,
              settings: { ...document.settings, ...values },
              version: document.version + 1,
              updatedAt: new Date().toISOString(),
            }),
            `settings:${Object.keys(values).sort().join(",")}`,
          ),
        ),

      loadDocument: (document) =>
        set({
          document: cloneDocument(document),
          selectedBlockId: null,
          past: [],
          future: [],
          isDirty: false,
          lastSavedAt: document.updatedAt,
          historyKey: null,
          historyAt: 0,
        }),

      newDocument: () =>
        set({
          document: makeBlankDocument(),
          selectedBlockId: null,
          past: [],
          future: [],
          isDirty: true,
          lastSavedAt: null,
          historyKey: null,
          historyAt: 0,
          surface: "design",
        }),

      undo: () =>
        set((state) => {
          const previous = state.past.at(-1);
          if (!previous) return state;
          return {
            document: cloneDocument(previous),
            past: state.past.slice(0, -1),
            future: [cloneDocument(state.document), ...state.future].slice(
              0,
              HISTORY_LIMIT,
            ),
            selectedBlockId: null,
            isDirty: true,
            historyKey: null,
            historyAt: 0,
          };
        }),

      redo: () =>
        set((state) => {
          const next = state.future[0];
          if (!next) return state;
          return {
            document: cloneDocument(next),
            past: [...state.past, cloneDocument(state.document)].slice(
              -HISTORY_LIMIT,
            ),
            future: state.future.slice(1),
            selectedBlockId: null,
            isDirty: true,
            historyKey: null,
            historyAt: 0,
          };
        }),

      markSaved: (savedAt) =>
        set((state) => {
          const timestamp = savedAt ?? state.document.updatedAt;
          return {
            isDirty:
              state.document.updatedAt === timestamp ? false : state.isDirty,
            lastSavedAt: timestamp,
          };
        }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setEmailClient: (emailClient) => set({ emailClient }),
      setSurface: (surface) => set({ surface }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "northstar-email-builder",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? serverStorage : window.localStorage,
      ),
      partialize: (state) => ({
        document: state.document,
        previewMode: state.previewMode,
        emailClient: state.emailClient,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export const selectSelectedBlock = (state: BuilderState) =>
  state.selectedBlockId
    ? findBlock(state.document.blocks, state.selectedBlockId)
    : undefined;
