"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_22%,transparent)]",
  secondary:
    "bg-muted border border-border text-foreground hover:bg-surface-3 disabled:opacity-50",
  ghost:
    "bg-transparent hover:bg-muted text-foreground disabled:opacity-50",
  accent:
    "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_22%,transparent)]",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
  gemma:
    "bg-gemma text-white hover:opacity-90 disabled:opacity-50 shadow-[0_0_24px_var(--gemma-glow)]",
  outline:
    "bg-transparent border border-border-strong text-foreground hover:bg-muted disabled:opacity-50",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-[var(--vf-radius-sm)]",
  md: "h-10 px-4 text-sm rounded-[var(--vf-radius-sm)]",
  lg: "h-11 px-5 text-sm rounded-[var(--vf-radius-md)]",
  icon: "h-9 w-9 p-0 rounded-[var(--vf-radius-sm)]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
  }
>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium vf-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
