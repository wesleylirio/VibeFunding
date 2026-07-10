"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export function StakeholderUpdateForm({
  projectId,
  buildRoundId,
  initialId,
  initialTitle,
  initialBody,
}: {
  projectId: string;
  buildRoundId?: string;
  initialId?: string;
  initialTitle: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [id, setId] = useState(initialId);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [hints, setHints] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/founder/stakeholder-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            projectId,
            buildRoundId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generate failed");
        setTitle(data.draft.title);
        setBody(data.draft.body);
        setHints([
          ...(data.suggestions || []),
          ...(data.sensitiveHints || []),
        ]);
        setMessage(`Draft generated (${data.provider}). Review before publishing.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generate failed");
      }
    });
  }

  async function save() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/founder/stakeholder-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save",
            id,
            projectId,
            buildRoundId,
            title,
            body,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setId(data.update.id);
        setMessage("Draft saved. Not visible to investors until published.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function publish() {
    if (!confirm("Publish this update to the investor feed? This cannot be undone in demo without reset.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/founder/stakeholder-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "publish",
            id,
            projectId,
            buildRoundId,
            title,
            body,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Publish failed");
        setId(data.update.id);
        setMessage("Published. Switch to Investor Mode to see it on the portfolio feed.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Publish failed");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Generate & publish update</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Gemma drafts — you edit, approve, and publish. Nothing ships without confirmation.
          </p>
        </div>
        <Badge variant="gemma">Founder assist</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="gemma" onClick={generate} disabled={pending}>
            Generate with Gemma
          </Button>
          <Button type="button" variant="secondary" onClick={save} disabled={pending}>
            Save draft
          </Button>
          <Button type="button" onClick={publish} disabled={pending || !title || !body}>
            Approve & publish
          </Button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Body</label>
          <Textarea
            className="mt-1 min-h-56"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {hints.length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Gemma suggestions
            </div>
            <ul className="mt-1 space-y-1">
              {hints.map((h) => (
                <li key={h}>• {h}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
