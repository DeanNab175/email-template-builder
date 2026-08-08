"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, SlidersHorizontal, Trash2 } from "lucide-react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { PropertyField } from "@/components/editor/property-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blockRegistry } from "@/features/rendering/block-registry";
import { blockSchemas } from "@/schemas";
import type {
  BlockProps,
  EmailBlock,
  PropertyField as PropertyFieldDefinition,
} from "@/types";

interface CustomBlockPropertiesProps {
  block: EmailBlock;
  isRoot: boolean;
  onUpdate: (id: string, props: BlockProps) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CustomBlockProperties({
  block,
  isRoot,
  onUpdate,
  onDuplicate,
  onDelete,
}: CustomBlockPropertiesProps) {
  const schema = blockSchemas[block.type];
  const methods = useForm<BlockProps>({
    defaultValues: block.props,
    resolver: zodResolver(schema) as unknown as Resolver<BlockProps>,
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset(block.props);
    // Reset only when the selected draft block changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  useEffect(
    () =>
      methods.subscribe({
        formState: { values: true },
        callback: ({ values, type }) => {
          if (type === "change") onUpdate(block.id, values);
        },
      }),
    [block.id, methods, onUpdate],
  );

  const groups = useMemo(() => {
    const grouped = new Map<
      PropertyFieldDefinition["group"],
      PropertyFieldDefinition[]
    >();
    for (const field of blockRegistry[block.type].fields) {
      grouped.set(field.group, [...(grouped.get(field.group) ?? []), field]);
    }
    return [...grouped.entries()];
  }, [block.type]);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
        <SlidersHorizontal className="size-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Block properties
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={(event) => event.preventDefault()}>
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge>{isRoot ? "wrapper" : block.type}</Badge>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {blockRegistry[block.type].label}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {blockRegistry[block.type].description}
                  </p>
                </div>
                {!isRoot && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onDuplicate(block.id)}
                      aria-label="Duplicate draft block"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      className="size-8"
                      onClick={() => onDelete(block.id)}
                      aria-label="Delete draft block"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {groups.map(([group, fields]) => (
              <fieldset
                key={group}
                className="border-b border-slate-100 p-4 dark:border-slate-800"
              >
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
      </div>
    </aside>
  );
}
