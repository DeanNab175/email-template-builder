"use client";

import { useMemo } from "react";
import { AlertTriangle, Lock, MoreHorizontal, RefreshCw } from "lucide-react";
import { renderEmailHtml } from "@/lib/email";
import { cn } from "@/lib/utils/cn";
import { useBuilderStore } from "@/store/builder-store";

const clientLabels = {
  gmail: "Gmail · Inbox",
  outlook: "Outlook · Focused",
  "apple-mail": "Apple Mail · Inbox",
};

export function EmailPreview() {
  const document = useBuilderStore((state) => state.document);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const emailClient = useBuilderStore((state) => state.emailClient);
  const result = useMemo(() => {
    try {
      return { html: renderEmailHtml(document), error: "" };
    } catch (error) {
      return {
        html: "",
        error:
          error instanceof Error
            ? error.message
            : "The template is not ready to preview.",
      };
    }
  }, [document]);

  if (result.error) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/50">
          <AlertTriangle className="mx-auto mb-3 size-6 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-950 dark:text-amber-100">
            Preview needs a quick fix
          </h2>
          <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
            Complete the highlighted property fields, then return to preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-5 sm:p-8">
      <div
        className={cn(
          "mx-auto overflow-hidden rounded-[18px] border border-slate-300 bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,.4)] transition-[width] duration-300 dark:border-slate-700 dark:bg-slate-900",
          previewMode === "mobile"
            ? "w-[390px] max-w-full"
            : "w-[860px] max-w-full",
          emailClient === "outlook" && "rounded-sm",
        )}
      >
        <div className="flex h-11 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex h-7 max-w-sm min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium dark:border-slate-700 dark:bg-slate-950">
            <Lock className="size-2.5" /> {clientLabels[emailClient]}
          </div>
          <RefreshCw className="size-3" />
          <MoreHorizontal className="size-4" />
        </div>
        <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {document.subject || "(No subject)"}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
            {document.preheader || "No preheader supplied"}
          </p>
        </div>
        <iframe
          title={`${document.name} email preview in ${clientLabels[emailClient]}`}
          srcDoc={result.html}
          sandbox=""
          className={cn(
            "block w-full border-0 bg-white",
            previewMode === "mobile" ? "h-[720px]" : "h-[760px]",
          )}
        />
      </div>
    </div>
  );
}
