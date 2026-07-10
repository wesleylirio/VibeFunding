"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GemmaOrb } from "@/components/gemma/gemma-orb";
import type { QuickstartDraft } from "@/lib/founder/quickstart";

const STAGES = ["Idea", "Prototype", "MVP", "Early Revenue", "Growth"];

const GEN_STEPS = [
  "Understanding the project",
  "Structuring the opportunity",
  "Preparing the Build Round",
  "Estimating productive resources",
  "Creating investor communication",
  "Drafting the One-Paper",
];

export default function FounderQuickstartPage() {
  const router = useRouter();
  const [building, setBuilding] = useState("");
  const [stage, setStage] = useState("MVP");
  const [nextGoal, setNextGoal] = useState("");
  const [evidence, setEvidence] = useState("");
  const [draft, setDraft] = useState<QuickstartDraft | null>(null);
  const [genStep, setGenStep] = useState(-1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [userName, setUserName] = useState("Founder");
  const [initials, setInitials] = useState("FD");

  useEffect(() => {
    fetch("/api/demo/session")
      .then((r) => r.json())
      .then((s) => {
        if (s.loggedIn && s.displayName) {
          setUserName(s.displayName);
          setInitials(s.initials || "FD");
        } else {
          router.replace("/login?role=FOUNDER&next=/founder/quickstart");
        }
      })
      .catch(() => {
        /* keep fallback */
      });
  }, [router]);

  async function generate() {
    setError(null);
    setDraft(null);
    setSavedSlug(null);
    startTransition(async () => {
      try {
        for (let i = 0; i < GEN_STEPS.length; i++) {
          setGenStep(i);
          await new Promise((r) => setTimeout(r, 350));
        }
        const res = await fetch("/api/founder/quickstart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            building,
            stage,
            nextGoal,
            evidence,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generate failed");
        setDraft(data.draft);
        setGenStep(-1);
      } catch (e) {
        setGenStep(-1);
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  async function save() {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/founder/quickstart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", draft }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setSavedSlug(data.slug);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <AppShell
      role="FOUNDER"
      userName={userName}
      initials={initials}
      title="Create with Gemma"
      subtitle="Draft a project and Build Round in minutes — you stay in control"
      vibeBalance={0}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="gemma">Gemma creates drafts only</Badge>
          <Link
            href="/founder/projects"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Create manually →
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GemmaOrb size={40} state="founder" />
              <div>
                <CardTitle>Quickstart questions</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Answer four prompts. Gemma prepares an editable draft — never publishes.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                What are you building?
              </label>
              <Textarea
                className="mt-1"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="A multiplayer layer for agentic developer tools…"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Stage</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStage(s)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      stage === s
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                What do you want to accomplish next?
              </label>
              <Input
                className="mt-1"
                value={nextGoal}
                onChange={(e) => setNextGoal(e.target.value)}
                placeholder="Ship multi-agent presence with tests and proofs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Resources or evidence you already have
              </label>
              <Textarea
                className="mt-1"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Prototype, users, repo, prior proofs…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="gemma"
                onClick={generate}
                disabled={pending || building.length < 3 || nextGoal.length < 3}
              >
                Generate draft with Gemma
              </Button>
              <Link
                href="/founder/projects"
                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm"
              >
                Create manually
              </Link>
            </div>
            {genStep >= 0 ? (
              <div className="rounded-xl border border-gemma/30 bg-gemma-soft p-3 text-sm">
                <div className="font-medium text-gemma">{GEN_STEPS[genStep]}…</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gemma transition-all"
                    style={{
                      width: `${((genStep + 1) / GEN_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </CardContent>
        </Card>

        {draft ? (
          <Card className="animate-reveal-up">
            <CardHeader>
              <CardTitle>Review draft</CardTitle>
              <Badge variant="outline">Editable · not published</Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Field
                label="Name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <Field
                label="Pitch"
                value={draft.pitch}
                onChange={(v) => setDraft({ ...draft, pitch: v })}
              />
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  className="mt-1"
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="font-medium">{draft.buildRound.title}</div>
                <p className="mt-1 text-muted-foreground">
                  {draft.buildRound.objective}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Est. {draft.buildRound.estimatedBuildUnits.toLocaleString()} Build
                  Units · Token ${draft.token.symbol}
                </p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {draft.buildRound.deliverables.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Investor summary
                </div>
                <p className="mt-1 text-muted-foreground">{draft.investorSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="accent" onClick={save} disabled={pending}>
                  Save as draft
                </Button>
                <Button type="button" variant="secondary" onClick={generate} disabled={pending}>
                  Regenerate
                </Button>
                {savedSlug ? (
                  <Link
                    href={`/projects/${savedSlug}`}
                    className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
                  >
                    Preview investor page
                  </Link>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Founders remain in control. Sprints can be edited manually. Gemma never
                publishes automatically.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
