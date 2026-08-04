"use client";

import { FileText, Mail, Settings2 } from "lucide-react";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/field";
import { useBuilderStore } from "@/store/builder-store";

export function DocumentProperties() {
  const document = useBuilderStore((state) => state.document);
  const updateDocument = useBuilderStore((state) => state.updateDocument);

  return (
    <div className="p-4">
      <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
          <Settings2 className="size-4" />
        </div>
        <h3 className="text-sm font-bold text-indigo-950">Campaign settings</h3>
        <p className="mt-1 text-[11px] leading-4 text-indigo-700">
          Select any block on the canvas to edit its properties.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="document-name">Template name</FieldLabel>
          <div className="relative">
            <FileText className="pointer-events-none absolute top-3 left-3 size-3.5 text-slate-400" />
            <Input
              id="document-name"
              className="pl-9"
              value={document.name}
              onChange={(event) => updateDocument({ name: event.target.value })}
            />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="document-subject">Subject line</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-3 left-3 size-3.5 text-slate-400" />
            <Input
              id="document-subject"
              className="pl-9"
              value={document.subject}
              maxLength={200}
              placeholder="A subject people will open"
              onChange={(event) =>
                updateDocument({ subject: event.target.value })
              }
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {document.subject.length}/200
          </p>
        </div>
        <div>
          <FieldLabel htmlFor="document-preheader">Preheader</FieldLabel>
          <Textarea
            id="document-preheader"
            value={document.preheader}
            maxLength={250}
            placeholder="The supporting inbox preview text"
            onChange={(event) =>
              updateDocument({ preheader: event.target.value })
            }
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {document.preheader.length}/250
          </p>
        </div>
        <div>
          <FieldLabel htmlFor="document-status">Status</FieldLabel>
          <Select
            id="document-status"
            value={document.status}
            onChange={(event) =>
              updateDocument({
                status: event.target.value as "draft" | "published",
              })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
