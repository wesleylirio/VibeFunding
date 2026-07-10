import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-border bg-muted/60 px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
