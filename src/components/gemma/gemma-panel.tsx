"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Minimize2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GemmaContext, GemmaProvider } from "@/lib/types";
import { GemmaOrb } from "@/components/gemma/gemma-orb";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: GemmaProvider;
};

function contextFromPath(pathname: string): {
  context: GemmaContext;
  projectSlug?: string;
  proofId?: string;
} {
  if (pathname.startsWith("/portfolio")) {
    return { context: "INVESTOR_PORTFOLIO" };
  }
  if (pathname.startsWith("/gemma")) {
    return { context: "INVESTOR_PORTFOLIO" };
  }
  if (pathname.startsWith("/proofs/")) {
    return {
      context: "PROOF_OF_BUILD",
      proofId: pathname.split("/")[2],
    };
  }
  if (pathname.startsWith("/founder")) {
    if (pathname.includes("stakeholder")) {
      return { context: "FOUNDER_STAKEHOLDER_UPDATE" };
    }
    if (pathname.includes("rounds")) {
      return { context: "FOUNDER_BUILD_ROUND" };
    }
    return { context: "FOUNDER_PROJECT" };
  }
  if (pathname.startsWith("/projects/")) {
    const parts = pathname.split("/");
    const slug = parts[2];
    if (parts[3] === "rounds") {
      return { context: "BUILD_ROUND_ANALYSIS", projectSlug: slug };
    }
    if (parts[3] === "agents") {
      return { context: "PROJECT_DILIGENCE", projectSlug: slug };
    }
    return { context: "PROJECT_DILIGENCE", projectSlug: slug };
  }
  if (pathname.startsWith("/discover") || pathname === "/") {
    return { context: "GLOBAL_DISCOVERY" };
  }
  return { context: "GLOBAL_DISCOVERY" };
}

const SUGGESTIONS: Record<string, string[]> = {
  GLOBAL_DISCOVERY: [
    "Which projects show Proof of Build evidence?",
    "Find AI Infrastructure opportunities",
    "What should a first-time tubarão look at?",
  ],
  INVESTOR_PORTFOLIO: [
    "Summarize my portfolio",
    "What is my concentration risk?",
    "What changed recently?",
  ],
  PROJECT_DILIGENCE: [
    "Summarize this project",
    "What are the main risks?",
    "Compare with my portfolio",
  ],
  BUILD_ROUND_ANALYSIS: [
    "Explain this Build Round",
    "What returns are simulated?",
    "What resources are still needed?",
  ],
  PROOF_OF_BUILD: [
    "Explain this Proof of Build",
    "Does this guarantee quality?",
    "What was consumed?",
  ],
  FOUNDER_PROJECT: [
    "Review project clarity",
    "What should stay private?",
    "Suggest stakeholder talking points",
  ],
  FOUNDER_BUILD_ROUND: [
    "Review this Build Round",
    "What fields are missing?",
    "Improve the public summary",
  ],
  FOUNDER_STAKEHOLDER_UPDATE: [
    "Generate a stakeholder update",
    "Soften technical language",
    "Flag sensitive content",
  ],
};

export function GemmaPanel({
  mobileOpen,
  onMobileClose,
  compact = false,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const ctx = useMemo(() => contextFromPath(pathname), [pathname]);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Gemma ready · context **${ctx.context.replaceAll("_", " ")}**. Ask for diligence, portfolio analysis, Proof explanations, or founder communication help. Demo/cached responses unless AMD live is configured.`,
        provider: "DEMO",
      },
    ]);
  }, [ctx.context, ctx.projectSlug, ctx.proofId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    setError(null);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/gemma/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            context: ctx.context,
            projectSlug: ctx.projectSlug,
            proofId: ctx.proofId,
          }),
        });
        if (!res.ok) throw new Error("Gemma request failed");
        const data = (await res.json()) as {
          content: string;
          provider: GemmaProvider;
        };
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.content,
            provider: data.provider,
          },
        ]);
      } catch {
        setError("Gemma is temporarily unavailable. Demo fallback failed.");
      }
    });
  }

  const suggestions = SUGGESTIONS[ctx.context] ?? SUGGESTIONS.GLOBAL_DISCOVERY;

  if (minimized && !compact) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-gemma px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6"
      >
        <GemmaOrb size={20} state="idle" pulse={false} />
        Gemma
      </button>
    );
  }

  const panel = (
    <div
      className={cn(
        "flex h-full flex-col border-l border-border bg-card",
        compact && "border-l-0"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <GemmaOrb size={32} state={pending ? "analyzing" : "idle"} pulse={pending} />
          <div>
            <div className="text-sm font-semibold">Gemma</div>
            <div className="text-[11px] text-muted-foreground">
              {ctx.context.replaceAll("_", " ")}
              {ctx.projectSlug ? ` · ${ctx.projectSlug}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!compact ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              onClick={() => setMinimized(true)}
              aria-label="Minimize Gemma"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          ) : null}
          {onMobileClose ? (
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={onMobileClose}
              aria-label="Close Gemma"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-6 bg-primary text-primary-foreground"
                : "mr-2 bg-gemma-soft text-foreground"
            )}
          >
            {m.role === "assistant" && m.provider ? (
              <div className="mb-1.5">
                <ProviderBadge provider={m.provider} />
              </div>
            ) : null}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {pending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Gemma is thinking…
          </div>
        ) : null}
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-gemma/30 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemma…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-gemma focus:ring-2 focus:ring-gemma/15"
          />
          <Button type="submit" variant="gemma" size="icon" disabled={pending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Not financial advice. Gemma never auto-invests or publishes founder content without confirmation.
        </p>
      </div>
    </div>
  );

  if (compact) return panel;

  return (
    <>
      <aside className="hidden w-[340px] shrink-0 xl:block">{panel}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 xl:hidden" onClick={onMobileClose}>
          <div
            className="absolute inset-y-0 right-0 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ProviderBadge({ provider }: { provider: GemmaProvider }) {
  const label =
    provider === "AMD_GEMMA"
      ? "Gemma Live · Fire"
      : provider === "CACHE"
        ? "Cached response"
        : "Local intelligence";
  return <Badge variant={provider === "AMD_GEMMA" ? "compute" : "gemma"}>{label}</Badge>;
}

export function GemmaFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full xl:hidden"
      aria-label="Open Gemma"
    >
      <GemmaOrb size={48} state="idle" />
    </button>
  );
}
