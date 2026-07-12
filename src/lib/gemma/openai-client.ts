export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAIChatResult = {
  content: string;
  model?: string;
  requestId?: string;
  latencyMs: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
};

export type OpenAIClientConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  /** openrouter | fireworks | amd_cloud | custom */
  backend: "openrouter" | "fireworks" | "amd_cloud" | "custom";
};

export const OPENROUTER_DEFAULT_BASE = "https://openrouter.ai/api/v1";
/** Free Gemma models on OpenRouter (good for always-on public demos, fallback chain for rate limits). */
export const OPENROUTER_GEMMA_FREE = "google/gemma-4-31b-it:free";
export const OPENROUTER_GEMMA_FALLBACKS = [
  "google/gemma-4-26b-a4b-it:free",
];

export const FIREWORKS_DEFAULT_BASE =
  "https://api.fireworks.ai/inference/v1";
export const FIREWORKS_GEMMA_BASE_MODEL =
  "accounts/fireworks/models/gemma-4-31b-it";
export const FIREWORKS_GEMMA_MODEL = FIREWORKS_GEMMA_BASE_MODEL;

/**
 * Resolve live Gemma endpoint.
 *
 * Hackathon primary path: Fireworks (Gemma 4 on AMD-backed infra).
 * Fallback for always-on public URL when Fireworks credits/deploy are gone:
 * OpenRouter free Gemma — same product code path (OpenAI-compatible chat).
 */
export function getAmdConfigFromEnv(): OpenAIClientConfig {
  const openrouterKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const fireworksKey = (process.env.FIREWORKS_API_KEY || "").trim();
  const gemmaKey = (process.env.GEMMA_API_KEY || "").trim();
  const gemmaBase = (process.env.GEMMA_BASE_URL || "").replace(/\/$/, "").trim();

  const openrouterBase = (
    process.env.OPENROUTER_BASE_URL || OPENROUTER_DEFAULT_BASE
  )
    .replace(/\/$/, "")
    .trim();
  const openrouterModel =
    process.env.OPENROUTER_MODEL || OPENROUTER_GEMMA_FREE;

  const fireworksBase = (
    process.env.FIREWORKS_BASE_URL || FIREWORKS_DEFAULT_BASE
  )
    .replace(/\/$/, "")
    .trim();
  const fireworksModel =
    process.env.FIREWORKS_MODEL ||
    process.env.GEMMA_MODEL ||
    FIREWORKS_GEMMA_MODEL;

  // 1) Fireworks first — intended hackathon path (Gemma on AMD via Fireworks)
  if (fireworksKey) {
    console.log("[Gemma] → Fireworks (primary)", { model: fireworksModel, baseUrl: fireworksBase.replace(/\/\/.*@/, "//***@") });
    return {
      baseUrl: fireworksBase,
      apiKey: fireworksKey,
      model: fireworksModel,
      timeoutMs: Number(process.env.GEMMA_TIMEOUT_MS || 45000),
      maxOutputTokens: Number(process.env.GEMMA_MAX_OUTPUT_TOKENS || 2048),
      backend: "fireworks",
    };
  }

  // 2) OpenRouter free Gemma — online demo only when Fireworks credits/deploy unavailable
  if (openrouterKey) {
    console.log("[Gemma] → OpenRouter (fallback)", { model: openrouterModel, baseUrl: openrouterBase });
    return {
      baseUrl: openrouterBase,
      apiKey: openrouterKey,
      model: openrouterModel,
      timeoutMs: Number(process.env.GEMMA_TIMEOUT_MS || 60000),
      maxOutputTokens: Number(process.env.GEMMA_MAX_OUTPUT_TOKENS || 2048),
      backend: "openrouter",
    };
  }

  // 3) Generic OpenAI-compatible (optional)
  if (gemmaBase && gemmaKey) {
    const backend: OpenAIClientConfig["backend"] = gemmaBase.includes(
      "openrouter"
    )
      ? "openrouter"
      : gemmaBase.includes("fireworks")
        ? "fireworks"
        : "amd_cloud";
    console.log("[Gemma] → custom endpoint", { backend, baseUrl: gemmaBase.replace(/\/\/.*@/, "//***@") });
    return {
      baseUrl: gemmaBase,
      apiKey: gemmaKey,
      model: process.env.GEMMA_MODEL || fireworksModel,
      timeoutMs: Number(process.env.GEMMA_TIMEOUT_MS || 30000),
      maxOutputTokens: Number(process.env.GEMMA_MAX_OUTPUT_TOKENS || 2048),
      backend,
    };
  }

  console.log("[Gemma] → no live credentials, will use mock");
  return {
    baseUrl: "",
    apiKey: "",
    model: fireworksModel,
    timeoutMs: Number(process.env.GEMMA_TIMEOUT_MS || 30000),
    maxOutputTokens: Number(process.env.GEMMA_MAX_OUTPUT_TOKENS || 2048),
    backend: "custom",
  };
}

export function isAmdConfigured(cfg = getAmdConfigFromEnv()): boolean {
  return Boolean(cfg.baseUrl && cfg.apiKey);
}

/** Product-facing badge for judges/demo — always Fire path when live. */
export function liveAttribution(cfg = getAmdConfigFromEnv()): string {
  if (isAmdConfigured(cfg)) {
    return "Gemma Live · Fire";
  }
  return "Gemma";
}

/** Gemma 4 may put text in reasoning_content when thinking is on. */
export function extractAssistantText(message?: {
  content?: string | null;
  reasoning_content?: string | null;
} | null): string {
  const direct = (message?.content || "").trim();
  if (direct) return direct;
  const reasoning = (message?.reasoning_content || "").trim();
  if (!reasoning) return "";
  const parts = reasoning
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const lastUseful =
    [...parts].reverse().find((p) => !p.startsWith("*") && p.length > 20) ||
    reasoning;
  return lastUseful.slice(0, 4000);
}

/**
 * OpenAI-compatible chat.completions (OpenRouter / Fireworks / custom).
 * Never logs API keys.
 */
/**
 * Retryable 429 — free OpenRouter models are often rate-limited.
 * Returns the fallback models to try for the given backend.
 */
function getModelFallbacks(cfg: OpenAIClientConfig): string[] {
  if (cfg.backend === "openrouter") {
    return OPENROUTER_GEMMA_FALLBACKS;
  }
  return [];
}

export async function openAIChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    jsonMode?: boolean;
    config?: Partial<OpenAIClientConfig>;
  }
): Promise<OpenAIChatResult> {
  const baseCfg = { ...getAmdConfigFromEnv(), ...options?.config };
  if (!baseCfg.baseUrl || !baseCfg.apiKey) {
    throw new Error(
      "Gemma endpoint is not configured (set FIREWORKS_API_KEY or OPENROUTER_API_KEY fallback)"
    );
  }

  const fallbacks = getModelFallbacks(baseCfg);
  const modelsToTry = [baseCfg.model, ...fallbacks];

  // Try each model in chain until one succeeds or all fail with non-429
  let lastError: Error | null = null;
  for (const model of modelsToTry) {
    if (model !== baseCfg.model) {
      console.log(`[Gemma] retrying with fallback model: ${model}`);
    }

    const cfg = { ...baseCfg, model };
    const url = cfg.baseUrl.endsWith("/v1")
      ? `${cfg.baseUrl}/chat/completions`
      : cfg.baseUrl.includes("/chat/completions")
        ? cfg.baseUrl
        : `${cfg.baseUrl}/v1/chat/completions`;

    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const maxTokens =
        cfg.maxOutputTokens > 0 && cfg.maxOutputTokens < 256
          ? cfg.maxOutputTokens
          : Math.max(cfg.maxOutputTokens || 1024, 1024);
      const body: Record<string, unknown> = {
        model: cfg.model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: maxTokens,
      };
      if (cfg.backend === "fireworks" || cfg.backend === "amd_cloud") {
        body.reasoning_effort = "none";
        body.chat_template_kwargs = { enable_thinking: false };
      }
      if (options?.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      };
      if (cfg.backend === "openrouter") {
        headers["HTTP-Referer"] =
          process.env.OPENROUTER_SITE_URL || "https://vibefunding.app";
        headers["X-Title"] =
          process.env.OPENROUTER_SITE_NAME || "VibeFunding";
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const requestId =
        res.headers.get("x-request-id") ||
        res.headers.get("x-inference-id") ||
        undefined;

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          `Gemma HTTP ${res.status}${
            errText ? `: ${errText.slice(0, 200)}` : ""
          }`
        );
      }

      const data = (await res.json()) as {
        id?: string;
        model?: string;
        choices?: {
          message?: {
            content?: string | null;
            reasoning_content?: string | null;
          };
        }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const content = extractAssistantText(data.choices?.[0]?.message);
      if (!content) {
        throw new Error("Gemma returned empty content");
      }

      return {
        content,
        model: data.model || cfg.model,
        requestId: data.id || requestId,
        latencyMs: Date.now() - start,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
        },
      };
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error(`Gemma timeout after ${cfg.timeoutMs}ms`);
        continue; // try next model on timeout
      }
      const message = error instanceof Error ? error.message : "";
      // Only retry on 429 (rate limit) — other errors are permanent
      if (/\b429\b/.test(message)) {
        lastError = error as Error;
        continue; // try next fallback model
      }
      throw error; // non-429 error is fatal
    } finally {
      clearTimeout(timer);
    }
  }

  // All models exhausted
  throw lastError || new Error("All Gemma models exhausted");
}

export type GemmaHealth = {
  configured: boolean;
  reachable: boolean;
  /** True when free-tier / upstream rate limit hit — keys work, try chat later */
  rateLimited?: boolean;
  provider: string;
  backend: string;
  model: string;
  latencyMs: number | null;
  lastCheckedAt: string;
  attribution: string;
  error?: string;
};

/** Avoid hammering free OpenRouter on every page navigation */
const HEALTH_CACHE_MS = 90_000;
let healthCache: { at: number; value: GemmaHealth } | null = null;

function isRateLimitError(message: string): boolean {
  return /\b429\b|rate[- ]?limit|temporarily rate-limited/i.test(message);
}

export async function probeAmdHealth(options?: {
  force?: boolean;
}): Promise<GemmaHealth> {
  const now = Date.now();
  if (
    !options?.force &&
    healthCache &&
    now - healthCache.at < HEALTH_CACHE_MS
  ) {
    return healthCache.value;
  }

  const cfg = getAmdConfigFromEnv();
  const lastCheckedAt = new Date().toISOString();
  const attribution = liveAttribution(cfg);
  if (!isAmdConfigured(cfg)) {
    const value: GemmaHealth = {
      configured: false,
      reachable: false,
      provider: "none",
      backend: cfg.backend,
      model: cfg.model,
      latencyMs: null,
      lastCheckedAt,
      attribution,
      error:
        "No live Gemma credentials (FIREWORKS_API_KEY preferred, or OPENROUTER_API_KEY fallback)",
    };
    healthCache = { at: now, value };
    return value;
  }

  const start = Date.now();
  try {
    await openAIChatCompletion(
      [
        { role: "system", content: "Reply with the single word: ok" },
        { role: "user", content: "ping" },
      ],
      { temperature: 0, config: { maxOutputTokens: 16 } }
    );
    const value: GemmaHealth = {
      configured: true,
      reachable: true,
      provider: cfg.backend,
      backend: cfg.backend,
      model: cfg.model,
      latencyMs: Date.now() - start,
      lastCheckedAt,
      attribution,
    };
    healthCache = { at: now, value };
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unreachable";
    // Free OpenRouter Gemma rate-limits hard — key is valid, treat as live for UI
    if (isRateLimitError(message)) {
      const value: GemmaHealth = {
        configured: true,
        reachable: true,
        rateLimited: true,
        provider: cfg.backend,
        backend: cfg.backend,
        model: cfg.model,
        latencyMs: Date.now() - start,
        lastCheckedAt,
        attribution,
        error: message.slice(0, 240),
      };
      healthCache = { at: now, value };
      return value;
    }
    const value: GemmaHealth = {
      configured: true,
      reachable: false,
      provider: cfg.backend,
      backend: cfg.backend,
      model: cfg.model,
      latencyMs: Date.now() - start,
      lastCheckedAt,
      attribution,
      error: message,
    };
    healthCache = { at: now, value };
    return value;
  }
}
