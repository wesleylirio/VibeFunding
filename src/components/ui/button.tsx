"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-white text-neutral-950 hover:bg-neutral-200 disabled:bg-neutral-600 disabled:text-neutral-400",
  secondary:
    "bg-white/5 border border-border text-foreground hover:bg-white/10 disabled:opacity-50",
  ghost: "bg-transparent hover:bg-white/5 text-foreground disabled:opacity-50",
  accent:
    "bg-accent text-white hover:bg-blue-500 disabled:opacity-50 shadow-[0_0_24px_rgba(91,140,255,0.25)]",
  danger: "bg-danger text-white hover:bg-red-500 disabled:opacity-50",
  gemma:
    "bg-gemma text-neutral-950 hover:bg-violet-300 disabled:opacity-50 shadow-[0_0_24px_rgba(167,139,250,0.3)]",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9 p-0",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
