"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Eye,
  FolderOpen,
  Laptop,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Undo2,
} from "lucide-react";
import { TemplateDrawer } from "@/features/templates/template-drawer";
import { ThemeToggle } from "@/components/builder/theme-toggle";
import { useSaveTemplate } from "@/features/templates/template-queries";
import { renderEmailHtml } from "@/lib/email";
import { downloadFile, slugify } from "@/lib/utils/download";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/store/builder-store";
import { Button } from "@/components/ui/button";

export function BuilderToolbar() {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportError, setExportError] = useState("");
  const document = useBuilderStore((state) => state.document);
  const past = useBuilderStore((state) => state.past);
  const future = useBuilderStore((state) => state.future);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const isDirty = useBuilderStore((state) => state.isDirty);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const markSaved = useBuilderStore((state) => state.markSaved);
  const surface = useBuilderStore((state) => state.surface);
  const setSurface = useBuilderStore((state) => state.setSurface);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const setPreviewMode = useBuilderStore((state) => state.setPreviewMode);
  const emailClient = useBuilderStore((state) => state.emailClient);
  const setEmailClient = useBuilderStore((state) => state.setEmailClient);
  const saveTemplate = useSaveTemplate();

  const save = async () => {
    const saved = await saveTemplate.mutateAsync(document);
    markSaved(saved.updatedAt);
  };

  const exportHtml = () => {
    try {
      downloadFile(
        renderEmailHtml(document),
        `${slugify(document.name)}.html`,
        "text/html;charset=utf-8",
      );
      setExportError("");
      setExportOpen(false);
    } catch {
      setExportError(
        "Complete the invalid property fields before exporting HTML.",
      );
    }
  };

  return (
    <>
      <header className="relative z-40 flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-3 shadow-sm sm:px-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex w-auto shrink-0 items-center gap-2.5 sm:w-60">
          <div className="flex size-8 items-center justify-center rounded-[10px] bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <span className="text-sm font-black tracking-tighter">N</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Northstar
            </p>
            <p className="truncate text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Email Studio
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!past.length}
            aria-label="Undo"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!future.length}
            aria-label="Redo"
          >
            <Redo2 className="size-4" />
          </Button>
          <span className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setSurface("design")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition",
                surface === "design"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              <Code2 className="size-3.5" /> Design
            </button>
            <button
              type="button"
              onClick={() => setSurface("preview")}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition",
                surface === "preview"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              <Eye className="size-3.5" /> Preview
            </button>
          </div>
        </div>

        {surface === "preview" && (
          <div className="mr-3 hidden items-center gap-1 rounded-lg border border-slate-200 p-1 xl:flex dark:border-slate-700">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={cn(
                "rounded p-1.5",
                previewMode === "desktop"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500",
              )}
              aria-label="Desktop preview"
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={cn(
                "rounded p-1.5",
                previewMode === "mobile"
                  ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500",
              )}
              aria-label="Mobile preview"
            >
              <Smartphone className="size-3.5" />
            </button>
            <select
              value={emailClient}
              onChange={(event) =>
                setEmailClient(event.target.value as typeof emailClient)
              }
              className="h-7 border-0 bg-transparent pl-1 text-[11px] font-semibold text-slate-600 outline-none dark:text-slate-300"
              aria-label="Email client simulation"
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="apple-mail">Apple Mail</option>
            </select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="mr-1 hidden items-center gap-1.5 text-[10px] font-medium text-slate-400 2xl:flex">
            {isDirty ? (
              <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
            ) : (
              <Check className="size-3 text-emerald-500" />
            )}
            {isDirty
              ? "Saving draft…"
              : lastSavedAt
                ? "All changes saved"
                : "Ready"}
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplatesOpen(true)}
            aria-label="Templates"
          >
            <FolderOpen className="size-3.5" />{" "}
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={saveTemplate.isPending}
            aria-label="Save template"
          >
            <Save className="size-3.5" />{" "}
            <span className="hidden sm:inline">Save</span>
          </Button>
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setExportOpen((value) => !value)}
            >
              Export <ChevronDown className="size-3.5" />
            </Button>
            {exportOpen && (
              <div className="absolute top-10 right-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={exportHtml}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Code2 className="size-4 text-indigo-500" />
                  <span>
                    <strong className="block text-xs text-slate-800 dark:text-slate-100">
                      Email HTML
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Inlined, Outlook-ready markup
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadFile(
                      JSON.stringify(document, null, 2),
                      `${slugify(document.name)}.json`,
                      "application/json",
                    );
                    setExportOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Laptop className="size-4 text-indigo-500" />
                  <span>
                    <strong className="block text-xs text-slate-800 dark:text-slate-100">
                      Template JSON
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Portable editable source
                    </span>
                  </span>
                </button>
                {exportError && (
                  <p className="rounded-lg bg-rose-50 p-2 text-[10px] leading-4 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                    {exportError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <TemplateDrawer
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
      />
    </>
  );
}
