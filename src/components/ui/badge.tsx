import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-muted text-foreground",
  accent: "bg-accent-soft text-accent",
  success: "bg-[var(--success-soft)] text-success",
  warning: "bg-[var(--warning-soft)] text-warning",
  danger: "bg-[var(--danger-soft)] text-danger",
  gemma: "bg-gemma-soft text-gemma",
  outline: "bg-transparent border border-border text-muted-foreground",
  vibe: "bg-sky-500/10 text-vibe border border-sky-500/20",
  pending: "bg-amber-500/10 text-warning border border-amber-500/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
