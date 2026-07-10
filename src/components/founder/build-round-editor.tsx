"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BuildRoundEditor({
  projectId,
  initial,
}: {
  projectId: string;
  initial: {
    id?: string;
    title: string;
    objective: string;
    targetValue: number;
    expectedDeliverables: string[];
    risks: string[];
    publicSummary: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(initial.title);
  const [objective, setObjective] = useState(initial.objective);
  const [targetValue, setTargetValue] = useState(String(initial.targetValue));
  const [deliverables, setDeliverables] = useState(
    initial.expectedDeliverables.join("\n")
  );
  const [risks, setRisks] = useState(initial.risks.join("\n"));
  const [publicSummary, setPublicSummary] = useState(initial.publicSummary);
  const [message, setMessage] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/founder/rounds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: initial.id,
            projectId,
            title,
            objective,
            targetValue: Number(targetValue),
            expectedDeliverables: deliverables
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            risks: risks
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            publicSummary,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setMessage(`Saved as ${data.round.status} draft.`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function askGemma() {
    setReview(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/gemma/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Review clarity of this Build Round titled "${title}". Objective: ${objective}. Deliverables: ${deliverables}. Risks: ${risks}.`,
            context: "FOUNDER_BUILD_ROUND",
            projectId,
            buildRoundId: initial.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gemma failed");
        setReview(data.content);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gemma failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Edit Build Round</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Save as draft. Gemma can review clarity — it will not publish for you.
          </p>
        </div>
        <Badge variant="outline">DRAFT capable</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Objective</label>
          <Textarea
            className="mt-1"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Target value (simulated)</label>
          <Input
            className="mt-1"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">
            Deliverables (one per line)
          </label>
          <Textarea
            className="mt-1"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Risks (one per line)</label>
          <Textarea className="mt-1" value={risks} onChange={(e) => setRisks(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Public summary</label>
          <Textarea
            className="mt-1"
            value={publicSummary}
            onChange={(e) => setPublicSummary(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={save} disabled={pending}>
            Save draft
          </Button>
          <Button type="button" variant="gemma" onClick={askGemma} disabled={pending}>
            Ask Gemma to review
          </Button>
        </div>
        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {review ? (
          <div className="rounded-lg border border-indigo-100 bg-gemma-soft p-3 text-sm whitespace-pre-wrap">
            {review}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
