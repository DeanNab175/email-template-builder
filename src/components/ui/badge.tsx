import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
