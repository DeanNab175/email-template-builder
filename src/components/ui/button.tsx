import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" &&
          "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        variant === "ghost" &&
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
        variant === "danger" &&
          "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4",
        size === "icon" && "size-9 p-0",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
