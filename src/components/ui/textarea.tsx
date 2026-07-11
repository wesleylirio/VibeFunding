import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-[var(--vf-radius-sm)] border border-border bg-muted/60 px-3 py-2 text-sm text-foreground outline-none vf-transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
