"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, SlidersHorizontal, Trash2, X } from "lucide-react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { DocumentProperties } from "@/components/editor/document-properties";
import { PropertyField } from "@/components/editor/property-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blockRegistry } from "@/features/rendering/block-registry";
import { blockSchemas } from "@/schemas";
import { selectSelectedBlock, useBuilderStore } from "@/store/builder-store";
import type {
  BlockProps,
  PropertyField as PropertyFieldDefinition,
} from "@/types";

export function PropertyEditor() {
  const block = useBuilderStore(selectSelectedBlock);
  const selectBlock = useBuilderStore((state) => state.selectBlock);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);
  const duplicateBlock = useBuilderStore((state) => state.duplicateBlock);
  const deleteBlock = useBuilderStore((state) => state.deleteBlock);
  const schema = block ? blockSchemas[block.type] : blockSchemas.text;
  const methods = useForm<BlockProps>({
    defaultValues: block?.props ?? {},
    resolver: zodResolver(schema) as unknown as Resolver<BlockProps>,
    mode: "onChange",
  });

  useEffect(() => {
    if (block) methods.reset(block.props);
    // Reset only when selection changes; live property updates should not disturb field focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block?.id]);

  useEffect(() => {
    if (!block) return;
    return methods.subscribe({
      formState: { values: true },
      callback: ({ values, type }) => {
        if (type === "change") updateBlockProps(block.id, values);
      },
    });
  }, [block, methods, updateBlockProps]);

  const groups = useMemo(() => {
    if (!block) return [];
    const grouped = new Map<
      PropertyFieldDefinition["group"],
      PropertyFieldDefinition[]
    >();
    for (const field of blockRegistry[block.type].fields) {
      grouped.set(field.group, [...(grouped.get(field.group) ?? []), field]);
    }
    return [...grouped.entries()];
  }, [block]);

  return (
    <aside
      className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white"
      aria-label="Properties panel"
    >
      <div className="flex h-[65px] items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Properties</h2>
        </div>
        {block && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => selectBlock(null)}
            aria-label="Close block properties"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!block ? (
          <DocumentProperties />
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={(event) => event.preventDefault()}>
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge>{block.type}</Badge>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">
                      {blockRegistry[block.type].label}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {blockRegistry[block.type].description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => duplicateBlock(block.id)}
                      aria-label="Duplicate selected block"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      className="size-8"
                      onClick={() => deleteBlock(block.id)}
                      aria-label="Delete selected block"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              {groups.map(([group, fields]) => (
                <fieldset key={group} className="border-b border-slate-100 p-4">
                  <legend className="mb-3 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                    {group}
                  </legend>
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <PropertyField key={field.key} field={field} />
                    ))}
                  </div>
                </fieldset>
              ))}
            </form>
          </FormProvider>
        )}
      </div>
    </aside>
  );
}
