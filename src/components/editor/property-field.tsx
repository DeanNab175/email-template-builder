"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/field";
import type {
  BlockProps,
  PropertyField as PropertyFieldDefinition,
} from "@/types";

export function PropertyField({ field }: { field: PropertyFieldDefinition }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<BlockProps>();
  const value = useWatch<BlockProps>({ name: field.key });
  const error = errors[field.key]?.message;
  const id = `property-${field.key}`;
  const numeric =
    field.kind === "number" ||
    field.kind === "range" ||
    field.options?.some((option) => typeof option.value === "number");
  const registration = register(
    field.key,
    numeric ? { valueAsNumber: true } : undefined,
  );
  const colorValue =
    typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
      ? value
      : "#000000";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        {field.kind === "range" && (
          <span className="mb-1.5 text-[10px] font-semibold text-slate-400">
            {String(value)}
          </span>
        )}
      </div>
      {field.kind === "textarea" ? (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          {...registration}
        />
      ) : field.kind === "checkbox" ? (
        <input
          id={id}
          type="checkbox"
          className="size-4 cursor-pointer rounded border-slate-300 accent-indigo-600"
          aria-invalid={Boolean(error)}
          {...registration}
        />
      ) : field.kind === "select" ? (
        <Select id={id} aria-invalid={Boolean(error)} {...registration}>
          {field.options?.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : field.kind === "color" ? (
        <div className="flex gap-2">
          <input
            id={id}
            type="color"
            name={registration.name}
            value={colorValue}
            className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
            aria-label={`${field.label} color picker`}
            aria-invalid={Boolean(error)}
            onBlur={registration.onBlur}
            onChange={(event) =>
              registration.onChange({
                target: {
                  name: registration.name,
                  value: event.target.value,
                },
                type: event.type,
              })
            }
          />
          <Input
            aria-label={`${field.label} hex value`}
            maxLength={7}
            aria-invalid={Boolean(error)}
            value={String(value ?? "")}
            {...registration}
          />
        </div>
      ) : (
        <Input
          id={id}
          type={
            field.kind === "range"
              ? "range"
              : field.kind === "url"
                ? "url"
                : field.kind === "number"
                  ? "number"
                  : "text"
          }
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          className={
            field.kind === "range"
              ? "h-8 cursor-pointer border-0 px-0 shadow-none focus:ring-0"
              : undefined
          }
          {...registration}
        />
      )}
      {field.help && !error && (
        <p className="mt-1 text-[10px] leading-4 text-slate-400">
          {field.help}
        </p>
      )}
      {error && (
        <p className="mt-1 text-[10px] font-medium text-rose-600" role="alert">
          {String(error)}
        </p>
      )}
    </div>
  );
}
