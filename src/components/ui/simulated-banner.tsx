/**
 * Legacy helper kept for internal tooling only.
 * Do not render product-facing "SIMULATED" labels in the investor UI.
 */
export function SimulatedBanner({
  text = "Internal note",
}: {
  text?: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}
