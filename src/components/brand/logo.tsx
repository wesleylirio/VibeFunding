import { cn } from "@/lib/utils";

/**
 * VibeFunding wordmark-only identity.
 * Do not invent or introduce a logo symbol (brand.md §4).
 */
export function VibeWordmark({
  className,
  size = "md",
  showTagline = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const text =
    size === "lg"
      ? "text-2xl md:text-3xl"
      : size === "sm"
        ? "text-sm"
        : "text-base";

  return (
    <div className={cn("leading-none", className)}>
      <div
        className={cn("font-display font-semibold tracking-tight", text)}
        aria-label="VibeFunding"
      >
        <span className="vf-wordmark-vibe">Vibe</span>
        <span className="vf-wordmark-funding">Funding</span>
      </div>
      {showTagline ? (
        <div className="mt-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground">
          Agentic startups
        </div>
      ) : null}
    </div>
  );
}
