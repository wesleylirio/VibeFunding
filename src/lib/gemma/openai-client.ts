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
};

export function getAmdConfigFromEnv(): OpenAIClientConfig {
  return {
    baseUrl: (process.env.GEMMA_BASE_URL || "").replace(/\/$/, ""),
    apiKey: process.env.GEMMA_API_KEY || "",
    model: process.env.GEMMA_MODEL || "google/gemma-4-12B-it",
    timeoutMs: Number(process.env.GEMMA_TIMEOUT_MS || 30000),
    maxOutputTokens: Number(process.env.GEMMA_MAX_OUTPUT_TOKENS || 2048),
  };
}

export function isAmdConfigured(cfg = getAmdConfigFromEnv()): boolean {
  return Boolean(cfg.baseUrl && cfg.apiKey);
}

/**
 * OpenAI-compatible chat.completions call for AMD-hosted Gemma.
 * Never logs API keys or full authorization headers.
 */
export async function openAIChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    jsonMode?: boolean;
    config?: Partial<OpenAIClientConfig>;
  }
): Promise<OpenAIChatResult> {
  const cfg = { ...getAmdConfigFromEnv(), ...options?.config };
  if (!cfg.baseUrl || !cfg.apiKey) {
    throw new Error("AMD Gemma endpoint is not configured");
  }

  const url = cfg.baseUrl.endsWith("/v1")
    ? `${cfg.baseUrl}/chat/completions`
    : cfg.baseUrl.includes("/chat/completions")
      ? cfg.baseUrl
      : `${cfg.baseUrl}/v1/chat/completions`;

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

  try {
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: cfg.maxOutputTokens,
    };
    if (options?.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
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
        `AMD Gemma HTTP ${res.status}${errText ? `: ${errText.slice(0, 200)}` : ""}`
      );
    }

    const data = (await res.json()) as {
      id?: string;
      model?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("AMD Gemma returned empty content");
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
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`AMD Gemma timeout after ${cfg.timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeAmdHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
  provider: string;
  model: string;
  latencyMs: number | null;
  lastCheckedAt: string;
  error?: string;
}> {
  const cfg = getAmdConfigFromEnv();
  const lastCheckedAt = new Date().toISOString();
  if (!isAmdConfigured(cfg)) {
    return {
      configured: false,
      reachable: false,
      provider: "amd",
      model: cfg.model,
      latencyMs: null,
      lastCheckedAt,
      error: "Endpoint URL or API credential not set",
    };
  }

  const start = Date.now();
  try {
    // Prefer models list if available, else tiny chat probe
    const modelsUrl = cfg.baseUrl.endsWith("/v1")
      ? `${cfg.baseUrl}/models`
      : `${cfg.baseUrl}/v1/models`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(cfg.timeoutMs, 15000));
    try {
      const res = await fetch(modelsUrl, {
        headers: { Authorization: `Bearer ${cfg.apiKey}` },
        signal: controller.signal,
      });
      if (res.ok) {
        return {
          configured: true,
          reachable: true,
          provider: "amd",
          model: cfg.model,
          latencyMs: Date.now() - start,
          lastCheckedAt,
        };
      }
    } finally {
      clearTimeout(timer);
    }

    await openAIChatCompletion(
      [
        { role: "system", content: "Reply with the single word: ok" },
        { role: "user", content: "ping" },
      ],
      { temperature: 0, config: { maxOutputTokens: 8 } }
    );
    return {
      configured: true,
      reachable: true,
      provider: "amd",
      model: cfg.model,
      latencyMs: Date.now() - start,
      lastCheckedAt,
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      provider: "amd",
      model: cfg.model,
      latencyMs: Date.now() - start,
      lastCheckedAt,
      error: error instanceof Error ? error.message : "unreachable",
    };
  }
}
