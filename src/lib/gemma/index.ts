import type { GemmaGateway } from "./types";
import { AmdGemmaGateway } from "./amd-gateway";
import { CachedGemmaGateway } from "./cached-gateway";
import { MockGemmaGateway } from "./mock-gateway";
import { isAmdConfigured } from "./openai-client";

let gateway: GemmaGateway | null = null;
let amdGateway: AmdGemmaGateway | null = null;

export type GemmaProviderMode = "auto" | "amd" | "mock" | "cache" | "demo";

export function getProviderMode(): GemmaProviderMode {
  const raw = (process.env.GEMMA_PROVIDER || "auto").toLowerCase();
  if (raw === "amd" || raw === "mock" || raw === "cache" || raw === "auto" || raw === "demo") {
    return raw;
  }
  return "auto";
}

/**
 * Provider selection:
 * - auto  → AMD if configured, else cached/mock fallbacks on each call
 * - amd   → Prefer AMD (still graceful fallback per-call)
 * - mock  → Deterministic only
 * - cache → Cached mock wrapper
 * - demo  → Same as mock (legacy)
 *
 * DEMO_MODE=true does NOT force mock when GEMMA_PROVIDER=auto|amd and credentials exist.
 * Product remains offline-safe when credentials are absent.
 */
export function getGemmaGateway(): GemmaGateway {
  if (gateway) return gateway;

  const mode = getProviderMode();

  if (mode === "mock" || mode === "demo") {
    gateway = new MockGemmaGateway();
    return gateway;
  }

  if (mode === "cache") {
    gateway = new CachedGemmaGateway(new MockGemmaGateway());
    return gateway;
  }

  // auto | amd → AmdGemmaGateway (internal mock fallback)
  amdGateway = new AmdGemmaGateway();
  gateway = amdGateway;
  return gateway;
}

export function getAmdGemmaGateway(): AmdGemmaGateway {
  if (!amdGateway) {
    amdGateway = new AmdGemmaGateway();
  }
  return amdGateway;
}

export function resetGemmaGatewayForTests() {
  gateway = null;
  amdGateway = null;
}

export function describeGemmaRuntime() {
  const mode = getProviderMode();
  const configured = isAmdConfigured();
  return {
    mode,
    amdConfigured: configured,
    willAttemptLive: (mode === "auto" || mode === "amd") && configured,
  };
}

export type { GemmaGateway } from "./types";
export { AmdGemmaGateway } from "./amd-gateway";
export { MockGemmaGateway } from "./mock-gateway";
export { probeAmdHealth } from "./openai-client";
export { invalidateCache } from "./cache";
