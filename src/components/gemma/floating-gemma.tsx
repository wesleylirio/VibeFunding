"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GemmaContext } from "@/lib/types";
import { Markdown } from "@/components/ui/markdown";
import { GemmaOrb, type GemmaState } from "@/components/gemma/gemma-orb";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  kind?: "insight" | "chat";
};

type PendingInsight = {
  key: string;
  teaser: string;
  content: string;
  title: string;
  provider?: string;
  attribution?: string | null;
};

function contextFromPath(pathname: string): {
  context: GemmaContext;
  projectSlug?: string;
  proofId?: string;
  key: string;
  proactive: boolean;
} {
  if (pathname.startsWith("/portfolio")) {
    return {
      context: "INVESTOR_PORTFOLIO",
      key: "portfolio",
      proactive: true,
    };
  }
  if (pathname.startsWith("/proofs/")) {
    const proofId = pathname.split("/")[2];
    return {
      context: "PROOF_OF_BUILD",
      proofId,
      key: `proof:${proofId}`,
      proactive: true,
    };
  }
  if (pathname.startsWith("/founder")) {
    return {
      context: "FOUNDER_PROJECT",
      key: "founder",
      proactive: true,
    };
  }
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/")[2];
    // Skip deep agent routes for diligence — still project context
    return {
      context: "PROJECT_DILIGENCE",
      projectSlug: slug,
      key: `project:${slug}`,
      proactive: !pathname.includes("/community"),
    };
  }
  if (pathname.startsWith("/discover") || pathname === "/") {
    // Fresh match insight after prefs (flag set by questionnaire)
    let matchPending = false;
    try {
      matchPending = sessionStorage.getItem("vf-gemma-match-pending") === "1";
    } catch {
      /* ignore */
    }
    return {
      context: "GLOBAL_DISCOVERY",
      key: matchPending ? `discover-match:${Date.now()}` : "discover",
      proactive: true,
    };
  }
  if (pathname.startsWith("/gemma")) {
    return {
      context: "INVESTOR_PORTFOLIO",
      key: "gemma-hub",
      proactive: false,
    };
  }
  return {
    context: "GLOBAL_DISCOVERY",
    key: "global",
    proactive: false,
  };
}

const SUGGESTIONS: Record<string, string[]> = {
  GLOBAL_DISCOVERY: [
    "Which projects fit me best?",
    "Why did you recommend those?",
    "Which have Proof of Build?",
  ],
  INVESTOR_PORTFOLIO: [
    "Summarize my portfolio",
    "What is my concentration risk?",
  ],
  PROJECT_DILIGENCE: [
    "Summarize this project",
    "What are the main risks?",
  ],
  BUILD_ROUND_ANALYSIS: ["Explain this Build Round", "What resources are needed?"],
  PROOF_OF_BUILD: ["Explain this Proof of Build", "What was completed?"],
  FOUNDER_PROJECT: ["Review project clarity", "Suggest stakeholder talking points"],
  FOUNDER_BUILD_ROUND: ["Review this Build Round", "What fields are missing?"],
  FOUNDER_STAKEHOLDER_UPDATE: ["Generate a stakeholder update"],
};

const SEEN_KEY = "vf-gemma-seen-insights";

function loadSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function markSeen(key: string) {
  try {
    const set = loadSeen();
    set.add(key);
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function FloatingGemma({
  open,
  onOpenChange,
  userName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}) {
  const pathname = usePathname();
  const ctx = useMemo(() => contextFromPath(pathname), [pathname]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [fetchingInsight, setFetchingInsight] = useState(false);
  const [pendingInsight, setPendingInsight] = useState<PendingInsight | null>(
    null
  );
  const [hasUnread, setHasUnread] = useState(false);
  const [attentionPulse, setAttentionPulse] = useState(false);
  /** Teaser bubble auto-hides after 10s; badge "1" stays */
  const [showTeaser, setShowTeaser] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const deliveredInChat = useRef<Set<string>>(new Set());
  const fetchGen = useRef(0);

  const gemmaState: GemmaState = fetchingInsight
    ? "analyzing"
    : hasUnread
      ? "reporting"
      : pathname.startsWith("/proofs")
        ? "proof"
        : pathname.startsWith("/founder")
          ? "founder"
          : pathname.startsWith("/portfolio")
            ? "monitoring"
            : pathname.startsWith("/discover")
              ? "comparing"
              : "idle";

  // Fetch proactive insight when route context changes
  useEffect(() => {
    if (!ctx.proactive) {
      setPendingInsight(null);
      setHasUnread(false);
      setFetchingInsight(false);
      return;
    }

    const gen = ++fetchGen.current;
    setFetchingInsight(true);
    // Keep prior unread state until we know; do not clear teaser mid-route flash

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/gemma/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: ctx.context,
            projectSlug: ctx.projectSlug,
            proofId: ctx.proofId,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as {
          teaser: string;
          title: string;
          content: string;
          provider?: string;
          attribution?: string | null;
          insightKey?: string;
        };
        if (gen !== fetchGen.current) return;

        const insightKey = data.insightKey || ctx.key;
        const insight: PendingInsight = {
          key: insightKey,
          teaser: data.teaser,
          title: data.title,
          content: data.content,
          provider: data.provider,
          attribution: data.attribution,
        };
        setPendingInsight(insight);

        if (insightKey.startsWith("discover-match:")) {
          try {
            sessionStorage.removeItem("vf-gemma-match-pending");
          } catch {
            /* ignore */
          }
        }

        // Notify while chat is closed; teaser bubble for 10s, badge stays.
        if (!open) {
          if (!deliveredInChat.current.has(insightKey)) {
            setHasUnread(true);
            setAttentionPulse(true);
            setShowTeaser(true);
          }
        } else if (!deliveredInChat.current.has(insightKey)) {
          injectInsight(insight);
        }
      } catch {
        if (gen !== fetchGen.current) return;
        setPendingInsight(null);
        setHasUnread(false);
      } finally {
        if (gen === fetchGen.current) setFetchingInsight(false);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- injectInsight stable enough via pendingInsight flow
  }, [ctx.key, ctx.context, ctx.projectSlug, ctx.proofId, ctx.proactive]);

  const injectInsight = useCallback((insight: PendingInsight) => {
    if (deliveredInChat.current.has(insight.key)) return;
    deliveredInChat.current.add(insight.key);
    markSeen(insight.key);
    setMessages((m) => [
      ...m,
      {
        id: `insight-${insight.key}-${Date.now()}`,
        role: "assistant",
        kind: "insight",
        content: insight.content,
      },
    ]);
    setHasUnread(false);
    setShowTeaser(false);
  }, []);

  // When chat opens (or insight arrives while open), deliver into the thread once
  useEffect(() => {
    if (!open || !pendingInsight || fetchingInsight) return;
    if (deliveredInChat.current.has(pendingInsight.key)) {
      setHasUnread(false);
      setShowTeaser(false);
      return;
    }
    injectInsight(pendingInsight);
  }, [open, pendingInsight, fetchingInsight, injectInsight]);

  // Reset thread on context change (keep conversation scoped to screen)
  useEffect(() => {
    setMessages([]);
    deliveredInChat.current.clear();
    setHasUnread(false);
    setPendingInsight(null);
    setAttentionPulse(false);
    setShowTeaser(false);
  }, [ctx.key]);

  // Auto-dismiss teaser bubble after 10s — keep the "1" badge
  useEffect(() => {
    if (!showTeaser || open) return;
    const t = window.setTimeout(() => setShowTeaser(false), 10_000);
    return () => window.clearTimeout(t);
  }, [showTeaser, open, ctx.key]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending, open, fetchingInsight]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      kind: "chat",
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
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as {
          content: string;
          provider?: string;
          attribution?: string | null;
        };
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            kind: "chat",
            content: data.content,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "I couldn't complete that request. Try again in a moment.",
          },
        ]);
      }
    });
  }

  const suggestions = SUGGESTIONS[ctx.context] ?? SUGGESTIONS.GLOBAL_DISCOVERY;
  const firstName = userName?.split(" ")[0];
  // Project pages: badge only. Elsewhere: teaser for 10s then badge only.
  const showTeaserBubble =
    showTeaser &&
    (hasUnread || fetchingInsight);

  function openChat() {
    onOpenChange(true);
  }

  return (
    <>
      {/* Bottom-right: unread badge on orb; teaser bubble off on project pages */}
      {!open ? (
        <div className="fixed bottom-20 right-[calc(1.25rem+10px)] z-40 flex flex-col items-end gap-2 md:bottom-8 md:right-[calc(1.5rem+10px)]">
          {showTeaserBubble ? (
            <button
              type="button"
              onClick={openChat}
              className={cn(
                "max-w-[260px] rounded-2xl border border-gemma/45 bg-card px-3.5 py-2.5 text-left text-xs leading-relaxed text-foreground shadow-xl transition",
                "animate-reveal-up hover:border-gemma hover:shadow-2xl",
                "relative before:absolute before:-bottom-1.5 before:right-5 before:h-3 before:w-3 before:rotate-45 before:border-b before:border-r before:border-gemma/45 before:bg-card"
              )}
            >
              <span className="mb-0.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gemma">
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gemma px-1 text-[10px] font-bold text-white">
                  1
                </span>
                Gemma
              </span>
              <span className="block text-[13px] text-foreground">
                {fetchingInsight && !pendingInsight
                  ? "Reviewing this page for you…"
                  : pendingInsight?.teaser ||
                    "I have something for you — tap to open."}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={openChat}
            className={cn(
              "relative shrink-0 rounded-full shadow-xl transition",
              hasUnread || attentionPulse
                ? "animate-gemma-attention ring-2 ring-gemma/50 ring-offset-2 ring-offset-background"
                : "",
              fetchingInsight ? "animate-gemma-attention" : ""
            )}
            aria-label={
              hasUnread
                ? "Open Gemma — 1 new message"
                : fetchingInsight
                  ? "Gemma is analyzing"
                  : "Open Gemma"
            }
          >
            <GemmaOrb
              size={56}
              state={
                fetchingInsight
                  ? "analyzing"
                  : hasUnread
                    ? "reporting"
                    : gemmaState
              }
              pulse
            />
            {(hasUnread || fetchingInsight) && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gemma px-1 text-[11px] font-bold leading-none text-white shadow-md ring-2 ring-background"
                aria-hidden
              >
                {fetchingInsight && !hasUnread ? "…" : "1"}
              </span>
            )}
            {fetchingInsight && !hasUnread ? (
              <span
                className="absolute inset-0 rounded-full border-2 border-gemma/30 animate-gemma-scan"
                aria-hidden
              />
            ) : null}
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          className={cn(
            "fixed z-50 flex flex-col border-border bg-card shadow-2xl",
            "inset-x-0 bottom-0 top-auto h-[min(88vh,720px)] rounded-t-3xl border-t",
            "md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-[400px] md:rounded-none md:border-l md:border-t-0"
          )}
          role="dialog"
          aria-label="Gemma assistant"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <GemmaOrb
                size={36}
                state={pending || fetchingInsight ? "analyzing" : gemmaState}
                pulse
              />
              <div>
                <div className="text-sm font-semibold">
                  Gemma{firstName ? ` · hi ${firstName}` : ""}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {fetchingInsight
                    ? "Analyzing this page…"
                    : `${ctx.context.replaceAll("_", " ").toLowerCase()}${
                        ctx.projectSlug ? ` · ${ctx.projectSlug}` : ""
                      }`}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
              aria-label="Close Gemma"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 && !fetchingInsight ? (
              <div className="rounded-2xl bg-gemma-soft px-3 py-2.5 text-sm text-foreground">
                Ask me about this page — risks, Build Rounds, portfolio
                concentration, or Proof of Build.
              </div>
            ) : null}
            {fetchingInsight && messages.length === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-gemma-soft px-3 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gemma" />
                Looking at this page…
              </div>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-2xl px-3 py-2.5 text-sm",
                  m.role === "user"
                    ? "ml-8 bg-primary text-primary-foreground"
                    : m.kind === "insight"
                      ? "mr-2 border border-gemma/25 bg-gemma-soft text-foreground"
                      : "mr-2 bg-muted text-foreground"
                )}
              >
                {m.role === "assistant" && m.kind === "insight" ? (
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gemma">
                    Insight for this page
                  </div>
                ) : null}
                {m.role === "assistant" ? (
                  <Markdown content={m.content} />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {pending ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
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
                className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm outline-none focus:border-gemma focus:ring-2 focus:ring-gemma/20"
              />
              <Button type="submit" variant="gemma" size="icon" disabled={pending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
