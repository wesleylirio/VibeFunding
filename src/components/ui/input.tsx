import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[var(--vf-radius-sm)] border border-border bg-muted/60 px-3 text-sm text-foreground outline-none vf-transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
