"use client";

import { useState, type FormEvent } from "react";
import { FileText, Mail, Plus, Settings2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/field";
import { fontPresets, googleFonts, systemFonts } from "@/constants/fonts";
import { useBuilderStore } from "@/store/builder-store";

const CUSTOM_FONT = "__custom__";
const safeFontStack = /^[a-zA-Z0-9\s,'_-]+$/;

export function DocumentProperties() {
  const document = useBuilderStore((state) => state.document);
  const updateDocument = useBuilderStore((state) => state.updateDocument);
  const updateSettings = useBuilderStore((state) => state.updateSettings);
  const presetFont = fontPresets.some(
    (font) => font.value === document.settings.fontFamily,
  );
  const fontKey = `${document.id}:${document.settings.fontFamily}`;
  const [customEditorFor, setCustomEditorFor] = useState<string | null>(null);
  const [customDraft, setCustomDraft] = useState<{
    fontKey: string;
    value: string;
  } | null>(null);
  const addingCustomFont = !presetFont || customEditorFor === fontKey;
  const customFont =
    customDraft?.fontKey === fontKey
      ? customDraft.value
      : presetFont
        ? ""
        : document.settings.fontFamily;
  const normalizedCustomFont = customFont.trim().replaceAll('"', "'");
  const customFontValid =
    normalizedCustomFont.length > 0 &&
    normalizedCustomFont.length <= 200 &&
    safeFontStack.test(normalizedCustomFont);

  const addCustomFont = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customFontValid) return;
    setCustomDraft(null);
    setCustomEditorFor(null);
    updateSettings({ fontFamily: normalizedCustomFont });
  };

  return (
    <div className="p-4">
      <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/50">
        <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
          <Settings2 className="size-4" />
        </div>
        <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
          Campaign settings
        </h3>
        <p className="mt-1 text-[11px] leading-4 text-indigo-700 dark:text-indigo-300">
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
      <section className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Type className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Fonts
            </h3>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
              Set the default typeface for the email.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="document-font">Font family</FieldLabel>
            <Select
              id="document-font"
              value={
                addingCustomFont ? CUSTOM_FONT : document.settings.fontFamily
              }
              onChange={(event) => {
                if (event.target.value === CUSTOM_FONT) {
                  setCustomEditorFor(fontKey);
                  return;
                }
                setCustomEditorFor(null);
                setCustomDraft(null);
                updateSettings({ fontFamily: event.target.value });
              }}
            >
              <optgroup label="Email-safe fonts">
                {systemFonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Google Fonts">
                {googleFonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </optgroup>
              <option value={CUSTOM_FONT}>Custom font stack…</option>
            </Select>
          </div>
          {addingCustomFont && (
            <form onSubmit={addCustomFont}>
              <FieldLabel htmlFor="document-custom-font">
                Add custom font stack
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="document-custom-font"
                  value={customFont}
                  maxLength={200}
                  placeholder="'Inter', Arial, sans-serif"
                  aria-invalid={customFont.length > 0 && !customFontValid}
                  onChange={(event) =>
                    setCustomDraft({
                      fontKey,
                      value: event.target.value,
                    })
                  }
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="primary"
                  disabled={!customFontValid}
                  aria-label="Add custom font"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Include email-safe fallbacks; support varies by email client.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
