import { cn } from "@/lib/utils";

/** Index washes — one obsidian/red atmosphere; Gemma keeps its navy identity. */
const WASH: Record<string, string> = {
  projects:
    "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,90,61,0.12),transparent_55%)]",
  gemma:
    "bg-[radial-gradient(ellipse_70%_55%_at_30%_40%,rgba(7,27,61,0.34),transparent_52%),radial-gradient(ellipse_55%_45%_at_80%_55%,rgba(22,79,156,0.2),transparent_50%),radial-gradient(ellipse_40%_40%_at_50%_80%,rgba(255,59,71,0.06),transparent_50%)]",
  proof:
    "bg-[radial-gradient(ellipse_70%_55%_at_75%_30%,rgba(255,59,71,0.12),transparent_52%),radial-gradient(ellipse_45%_40%_at_15%_70%,rgba(255,90,61,0.08),transparent_50%)]",
  rewards:
    "bg-[radial-gradient(ellipse_75%_55%_at_50%_100%,rgba(255,59,71,0.11),transparent_55%),radial-gradient(ellipse_40%_35%_at_20%_20%,rgba(255,90,61,0.09),transparent_50%)]",
  community:
    "bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(255,59,71,0.11),transparent_50%),radial-gradient(ellipse_45%_40%_at_15%_70%,rgba(255,90,61,0.08),transparent_50%)]",
};

export function SectionShell({
  id,
  children,
  className,
  narrow = false,
  wash,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  /** Soft brand gradient wash behind the section */
  wash?: keyof typeof WASH;
}) {
  return (
    <section
      id={id}
      className={cn(
        "vf-index-section relative scroll-mt-24",
        wash ? WASH[wash] : null,
        className
      )}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto w-full px-4 md:px-8",
          narrow
            ? "max-w-[var(--vf-index-reading-width)]"
            : "max-w-[var(--vf-index-max-width)]"
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}
