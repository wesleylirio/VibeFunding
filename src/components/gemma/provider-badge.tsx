import { Badge } from "@/components/ui/badge";

/**
 * Shows live AMD attribution only when provider is genuinely AMD_GEMMA.
 * Fallback/cache/demo responses show no fake live claim.
 */
export function GemmaProviderBadge({
  provider,
  attribution,
}: {
  provider?: string;
  attribution?: string | null;
}) {
  if (provider === "AMD_GEMMA" || attribution) {
    return (
      <Badge variant="gemma">
        {attribution || "Gemma 4 · AMD Instinct"}
      </Badge>
    );
  }
  return null;
}
