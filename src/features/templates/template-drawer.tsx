"use client";

import { useEffect, useRef, useState } from "react";
import {
  Copy,
  FileJson,
  FolderOpen,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useSaveTemplate,
  useTemplates,
} from "@/features/templates/template-queries";
import { downloadFile, slugify } from "@/lib/utils/download";
import { parseEmailDocument } from "@/schemas";
import { templateRepository } from "@/services/template-repository";
import { useBuilderStore } from "@/store/builder-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { starterTemplates } from "@/constants/starter-templates";
import { createId } from "@/lib/utils/id";

interface TemplateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateDrawer({ open, onClose }: TemplateDrawerProps) {
  const document = useBuilderStore((state) => state.document);
  const loadDocument = useBuilderStore((state) => state.loadDocument);
  const newDocument = useBuilderStore((state) => state.newDocument);
  const markSaved = useBuilderStore((state) => state.markSaved);
  const templates = useTemplates();
  const saveTemplate = useSaveTemplate();
  const duplicateTemplate = useDuplicateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  if (!open) return null;

  const handleSave = async () => {
    const saved = await saveTemplate.mutateAsync(document);
    markSaved(saved.updatedAt);
    setMessage("Template saved.");
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("Import must be smaller than 2 MB.");
      return;
    }
    try {
      const imported = parseEmailDocument(JSON.parse(await file.text()));
      loadDocument(imported);
      await saveTemplate.mutateAsync(imported);
      setMessage("Template imported.");
    } catch {
      setMessage("That file is not a valid Northstar template.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="templates-title"
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-950"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2
              id="templates-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Templates
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Saved locally in this browser.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close templates"
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="grid grid-cols-2 gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saveTemplate.isPending}
          >
            <Save className="size-4" /> Save current
          </Button>
          <Button
            onClick={() => {
              newDocument();
              onClose();
            }}
          >
            <Plus className="size-4" /> New blank
          </Button>
          <Button onClick={() => inputRef.current?.click()}>
            <FolderOpen className="size-4" /> Import JSON
          </Button>
          <Button
            onClick={() =>
              downloadFile(
                JSON.stringify(document, null, 2),
                `${slugify(document.name)}.json`,
                "application/json",
              )
            }
          >
            <FileJson className="size-4" /> Export JSON
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => handleImport(event.target.files?.[0])}
          />
        </div>
        {message && (
          <p
            className="border-b border-slate-100 bg-indigo-50 px-5 py-2 text-xs font-medium text-indigo-700 dark:border-slate-800 dark:bg-indigo-950/50 dark:text-indigo-300"
            role="status"
          >
            {message}
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="mb-5">
            <h3 className="mb-2 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Starter templates
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {starterTemplates.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50"
                  onClick={() => {
                    const now = new Date().toISOString();
                    loadDocument({
                      ...structuredClone(starter),
                      id: createId("template"),
                      createdAt: now,
                      updatedAt: now,
                    });
                    onClose();
                  }}
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {starter.name}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                    {starter.subject}
                  </span>
                </button>
              ))}
            </div>
          </section>
          {templates.isLoading && (
            <p className="py-12 text-center text-xs text-slate-500">
              Loading templates…
            </p>
          )}
          {!templates.isLoading && !templates.data?.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
              <FileJson className="mx-auto mb-3 size-6 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No saved templates yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Save the current campaign to add it here.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {templates.data?.map((template) => (
              <article
                key={template.id}
                className="group rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:hover:border-indigo-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={async () => {
                      const saved = await templateRepository.get(template.id);
                      if (saved) {
                        loadDocument(saved);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {template.name}
                      </p>
                      <Badge
                        className={
                          template.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : undefined
                        }
                      >
                        {template.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Updated {new Date(template.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => duplicateTemplate.mutate(template.id)}
                      aria-label={`Duplicate ${template.name}`}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-rose-600"
                      onClick={() => deleteTemplate.mutate(template.id)}
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
