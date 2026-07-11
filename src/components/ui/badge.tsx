import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-muted text-foreground",
  accent: "bg-accent-soft text-accent",
  primary: "bg-vibe-soft text-vibe",
  success: "bg-[var(--success-soft)] text-success",
  warning: "bg-[var(--warning-soft)] text-warning",
  danger: "bg-[var(--danger-soft)] text-danger",
  gemma: "bg-gemma-soft text-gemma",
  compute: "bg-[var(--compute-soft)] text-compute",
  teal: "bg-teal-soft text-teal",
  outline: "bg-transparent border border-border text-muted-foreground",
  vibe: "bg-vibe-soft text-vibe border border-[color-mix(in_oklab,var(--vibe)_25%,transparent)]",
  pending: "bg-[var(--warning-soft)] text-warning border border-[color-mix(in_oklab,var(--warning)_25%,transparent)]",
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
