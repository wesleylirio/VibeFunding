"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
};

function contextFromPath(pathname: string): {
  context: GemmaContext;
  projectSlug?: string;
  proofId?: string;
  insight: string;
} {
  if (pathname.startsWith("/portfolio")) {
    return {
      context: "INVESTOR_PORTFOLIO",
      insight:
        "Portfolio concentration leans developer tooling — ask me for a diversification read.",
    };
  }
  if (pathname.startsWith("/proofs/")) {
    return {
      context: "PROOF_OF_BUILD",
      proofId: pathname.split("/")[2],
      insight: "I can translate this Proof of Build into plain language for stakeholders.",
    };
  }
  if (pathname.startsWith("/founder")) {
    return {
      context: "FOUNDER_PROJECT",
      insight: "I can review Build Round clarity or draft a stakeholder update.",
    };
  }
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/")[2];
    if (pathname.includes("/agents")) {
      return {
        context: "PROJECT_DILIGENCE",
        projectSlug: slug,
        insight: "Watch how allocated resources convert into verified agent work.",
      };
    }
    return {
      context: "PROJECT_DILIGENCE",
      projectSlug: slug,
      insight: "Ask me for risks, traction signals, or how this fits your portfolio.",
    };
  }
  if (pathname.startsWith("/discover") || pathname === "/") {
    return {
      context: "GLOBAL_DISCOVERY",
      insight: "Looking for Proof-verified Build Rounds matching growth-stage builders?",
    };
  }
  if (pathname.startsWith("/gemma")) {
    return {
      context: "INVESTOR_PORTFOLIO",
      insight: "Open Portfolio Intelligence, Opportunity Matches, or Reports below.",
    };
  }
  return {
    context: "GLOBAL_DISCOVERY",
    insight: "I'm Gemma — your portfolio companion across discovery and execution.",
  };
}

const SUGGESTIONS: Record<string, string[]> = {
  GLOBAL_DISCOVERY: [
    "Which projects have Proof of Build?",
    "Find AI Infrastructure opportunities",
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
  PROOF_OF_BUILD: ["Explain this Proof of Build", "What was consumed?"],
  FOUNDER_PROJECT: ["Review project clarity", "Suggest stakeholder talking points"],
  FOUNDER_BUILD_ROUND: ["Review this Build Round", "What fields are missing?"],
  FOUNDER_STAKEHOLDER_UPDATE: ["Generate a stakeholder update"],
};

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
  const gemmaState: GemmaState = pathname.startsWith("/proofs")
    ? "proof"
    : pathname.startsWith("/founder")
      ? "founder"
      : pathname.startsWith("/portfolio")
        ? "monitoring"
        : pathname.startsWith("/discover")
          ? "comparing"
          : "idle";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
  }, [ctx.context, ctx.projectSlug, ctx.proofId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending, open]);

  async function send(text: string) {
    if (!text.trim() || pending) return;
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
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as {
          content: string;
          provider?: string;
          attribution?: string | null;
        };
        const prefix =
          data.provider === "AMD_GEMMA" && data.attribution
            ? `_${data.attribution}_\n\n`
            : "";
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: `${prefix}${data.content}`,
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

  return (
    <>
      {!open ? (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 md:bottom-6">
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="max-w-[240px] rounded-2xl border border-border bg-card/95 px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground shadow-xl backdrop-blur transition hover:border-gemma/40 hover:text-foreground"
          >
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gemma">
              Gemma{userName ? ` · ${userName.split(" ")[0]}` : ""}
            </span>
            {userName
              ? ctx.insight.replace(/^Your /, `${userName.split(" ")[0]}, your `)
              : ctx.insight}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="rounded-full"
            aria-label="Open Gemma"
          >
            <GemmaOrb size={56} state={gemmaState} />
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative z-10 flex h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <GemmaOrb size={36} state={pending ? "analyzing" : gemmaState} pulse={pending} />
                <div>
                  <div className="text-sm font-semibold">
                    Gemma{userName ? ` · hi ${userName.split(" ")[0]}` : ""}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {ctx.context.replaceAll("_", " ").toLowerCase()}
                    {ctx.projectSlug ? ` · ${ctx.projectSlug}` : ""}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-white/5"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
              <div className="rounded-2xl bg-gemma-soft px-3 py-2.5 text-sm text-foreground">
                {ctx.insight}
              </div>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl px-3 py-2.5 text-sm",
                    m.role === "user"
                      ? "ml-8 bg-white text-neutral-950"
                      : "mr-2 bg-muted text-foreground"
                  )}
                >
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
        </div>
      ) : null}
    </>
  );
}
