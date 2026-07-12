"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GemmaOrb } from "@/components/gemma/gemma-orb";
import {
  INTEREST_OPTIONS,
  STAGE_OPTIONS,
  RISK_OPTIONS,
  RESOURCE_PREF_OPTIONS,
  PRIORITY_OPTIONS,
  HORIZON_OPTIONS,
  ALLOCATION_SIZE_OPTIONS,
  LIQUIDITY_OPTIONS,
} from "@/lib/investor/preferences";
import { cn } from "@/lib/utils";

type Draft = {
  interests: string[];
  stage: string;
  risk: string;
  horizon: string;
  allocationSize: string;
  liquidity: string;
  resources: string[];
  priorities: string[];
};

const EMPTY: Draft = {
  interests: [],
  stage: "",
  risk: "",
  horizon: "",
  allocationSize: "",
  liquidity: "",
  resources: [],
  priorities: [],
};

type StepKey = keyof Draft;

export function PreferenceQuestionnaire({
  compact = false,
  onboarding = false,
  onComplete,
}: {
  compact?: boolean;
  /** Full first-use onboarding layout */
  onboarding?: boolean;
  onComplete?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const steps: {
    title: string;
    hint: string;
    options: { id: string; label: string }[];
    key: StepKey;
  }[] = [
    {
      title: "What kind of projects interest you?",
      hint: "Pick one focus area to start.",
      options: INTEREST_OPTIONS.map((o) => ({ id: o, label: o })),
      key: "interests",
    },
    {
      title: "Which project stage do you prefer?",
      hint: "Early is riskier; growing is more proven.",
      options: STAGE_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "stage",
    },
    {
      title: "What level of risk are you comfortable with?",
      hint: "Think about your ability to tolerate loss and uncertainty.",
      options: RISK_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "risk",
    },
    {
      title: "How long can your capital remain committed?",
      hint: "Early startup positions may take time to mature.",
      options: HORIZON_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "horizon",
    },
    {
      title: "How would you size a first investment?",
      hint: "Position sizing matters as much as project selection.",
      options: ALLOCATION_SIZE_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "allocationSize",
    },
    {
      title: "How important is access to liquidity?",
      hint: "Project rewards may not have an immediate market.",
      options: LIQUIDITY_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "liquidity",
    },
    {
      title: "What evidence would increase your conviction?",
      hint: "Choose the execution signal you trust most.",
      options: RESOURCE_PREF_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "resources",
    },
    {
      title: "What matters most to you?",
      hint: "Last step — Gemma will evaluate the full profile.",
      options: PRIORITY_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      key: "priorities",
    },
  ];

  const current = steps[step];
  const selected =
    current.key === "stage" || current.key === "risk" || current.key === "horizon" || current.key === "allocationSize" || current.key === "liquidity"
      ? draft[current.key]
        ? [draft[current.key]]
        : []
      : draft[current.key];

  function applyChoice(prev: Draft, key: StepKey, id: string): Draft {
    if (key === "stage" || key === "risk" || key === "horizon" || key === "allocationSize" || key === "liquidity") {
      return { ...prev, [key]: id };
    }
    return { ...prev, [key]: [id] };
  }

  function submitWith(nextDraft: Draft) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/demo/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            investorPreferences: {
              interests: nextDraft.interests,
              stage: nextDraft.stage,
              risk: nextDraft.risk,
              horizon: nextDraft.horizon,
              allocationSize: nextDraft.allocationSize,
              liquidity: nextDraft.liquidity,
              resources: nextDraft.resources,
              priorities: nextDraft.priorities,
            },
            onboardingSeen: true,
          }),
        });
        if (!res.ok) throw new Error("Could not save preferences");
        try {
          // Floating Gemma shows match insight once after onboarding
          sessionStorage.setItem("vf-gemma-match-pending", "1");
          sessionStorage.removeItem("vf-gemma-seen-insights");
        } catch {
          /* ignore */
        }
        onComplete?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save");
      }
    });
  }

  function select(id: string) {
    if (pending) return;
    setError(null);
    const nextDraft = applyChoice(draft, current.key, id);
    setDraft(nextDraft);

    if (step < steps.length - 1) {
      window.setTimeout(() => setStep((s) => s + 1), 120);
      return;
    }
    submitWith(nextDraft);
  }

  return (
    <div
      className={cn(
        "card-surface overflow-hidden",
        onboarding ? "p-6 md:p-8 shadow-[var(--vf-shadow-md)]" : compact ? "p-4" : "p-5 md:p-6"
      )}
    >
      <div className="flex items-start gap-3">
        <GemmaOrb size={onboarding ? 52 : compact ? 36 : 44} state="listening" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gemma">
            Let Gemma understand what you are looking for
          </div>
          {onboarding ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Answer a few questions. After that, Discover opens with projects
              matched to you.
            </p>
          ) : null}
          <h2
            className={cn(
              "mt-3 font-display font-semibold tracking-tight",
              onboarding ? "text-xl md:text-2xl" : "text-lg"
            )}
          >
            {current.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
            {pending ? " · saving…" : ` · ${current.hint}`}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 flex flex-wrap gap-2",
          onboarding && "gap-2.5"
        )}
      >
        {current.options.map((opt) => {
          const active = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={pending}
              onClick={() => select(opt.id)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                onboarding && "min-w-[7.5rem] px-4 py-3",
                active
                  ? "border-gemma bg-gemma-soft text-foreground"
                  : "border-border hover:bg-muted",
                pending && "opacity-60"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                onboarding ? "w-8" : "w-6",
                i < step
                  ? "bg-gemma"
                  : i === step
                    ? "bg-gemma w-10"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
        {step > 0 && !pending ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        ) : null}
      </div>
    </div>
  );
}
