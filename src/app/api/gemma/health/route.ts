import { NextResponse } from "next/server";
import { describeGemmaRuntime, probeAmdHealth } from "@/lib/gemma";
import { getAmdConfigFromEnv } from "@/lib/gemma/openai-client";

export const dynamic = "force-dynamic";

/**
 * Server-side diagnostics only. Never returns API keys or full credentials.
 */
export async function GET() {
  const runtime = describeGemmaRuntime();
  const cfg = getAmdConfigFromEnv();
  const health = await probeAmdHealth();

  // Redact any accidental secret-looking fields
  const safeError = health.error
    ? health.error
        .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
        .replace(/api[_-]?key[=:]\s*\S+/gi, "api_key=[redacted]")
    : undefined;

  return NextResponse.json({
    configured: health.configured,
    reachable: health.reachable,
    rateLimited: health.rateLimited ?? false,
    // UI "live" if keys exist and we can attempt (incl. free-tier 429)
    live: Boolean(
      health.configured && (health.reachable || health.rateLimited)
    ),
    provider: health.provider,
    backend: health.backend,
    mode: runtime.mode,
    model: health.model || cfg.model,
    latencyMs: health.latencyMs,
    lastCheckedAt: health.lastCheckedAt,
    willAttemptLive: runtime.willAttemptLive,
    attribution: health.attribution,
    endpointConfigured: Boolean(cfg.baseUrl),
    error: safeError,
  });
}
