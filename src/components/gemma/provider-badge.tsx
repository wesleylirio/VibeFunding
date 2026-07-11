import { Badge } from "@/components/ui/badge";

/**
 * Live Gemma attribution — honest about provider.
 * Never claims Fireworks/AMD unless that path was actually used.
 */
export function GemmaProviderBadge({
  provider,
  attribution,
}: {
  provider?: string;
  attribution?: string | null;
}) {
  if (provider === "AMD_GEMMA") {
    return (
      <Badge variant="gemma">
        {attribution || "Gemma Live · Fire"}
      </Badge>
    );
  }
  if (provider === "CACHE" || provider === "DEMO" || provider) {
    return <Badge variant="outline">Gemma</Badge>;
  }
  return null;
}
