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
    provider: health.provider,
    mode: runtime.mode,
    model: health.model || cfg.model,
    latencyMs: health.latencyMs,
    lastCheckedAt: health.lastCheckedAt,
    willAttemptLive: runtime.willAttemptLive,
    // never expose base URL host fully if it contains credentials; only whether set
    endpointConfigured: Boolean(cfg.baseUrl),
    error: safeError,
  });
}
