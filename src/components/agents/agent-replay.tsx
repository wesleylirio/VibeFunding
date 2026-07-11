"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileCode2,
  Pause,
  Play,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";

export type ReplayEvent = {
  id: string;
  sequence: number;
  type: string;
  title: string;
  publicMessage: string;
  visibility: string;
  delayMs: number;
  privatePayload?: Record<string, unknown>;
};

/** Target full run length at 1x (demo pacing). */
const TARGET_DURATION_MS = 60_000;

export function AgentReplay({
  run,
  events,
  role,
  projectName,
  accentColor = "#20d9c2",
  roundTitle,
  onComplete,
  compactHeader = false,
}: {
  run: {
    id: string;
    taskTitle: string;
    agentName: string;
    harness: string;
    model: string;
    provider: string;
    status: string;
    computeSource: string;
    inputTokens?: number | null;
    outputTokens?: number | null;
    computeTimeSeconds?: number | null;
    filesChanged?: number | null;
    testsPassed?: number | null;
    testsTotal?: number | null;
    commitHash?: string | null;
    replayLabel: string;
    publicSummary?: string | null;
  };
  events: ReplayEvent[];
  role: "INVESTOR" | "FOUNDER";
  projectName?: string;
  accentColor?: string;
  roundTitle?: string;
  /** Fired once when replay finishes (or is skipped) */
  onComplete?: () => void;
  compactHeader?: boolean;
}) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [cursor, setCursor] = useState(0);
  const done = events.length === 0 || cursor >= events.length;

  const productLabel =
    run.replayLabel.toLowerCase().includes("demo")
      ? "Execution replay"
      : run.replayLabel.toLowerCase().includes("recorded")
        ? "Recorded execution"
        : "Archived run";

  // Scale seed delays so total ≈ 60s at 1x
  const delayScale = useMemo(() => {
    const raw = events.reduce((s, e) => s + Math.max(200, e.delayMs || 500), 0);
    if (raw <= 0) return 1;
    return TARGET_DURATION_MS / raw;
  }, [events]);

  useEffect(() => {
    if (!playing || done) return;
    const base = Math.max(200, events[cursor]?.delayMs ?? 500);
    const delay = Math.max(250, (base * delayScale) / speed);
    const t = setTimeout(() => setCursor((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [playing, cursor, done, events, speed, delayScale]);

  useEffect(() => {
    if (done && events.length > 0) {
      onComplete?.();
    }
    // only when done flips true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const visible = useMemo(() => events.slice(0, cursor), [events, cursor]);
  const progress =
    events.length === 0 ? 100 : Math.min(100, Math.round((cursor / events.length) * 100));

  return (
    <div className="card-surface overflow-hidden">
      <div
        className="h-1.5 transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${accentColor}, #8268ff)`,
        }}
      />
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b border-border p-5",
          compactHeader && "p-4"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{ background: accentColor }}
          >
            {run.agentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{run.taskTitle}</h2>
              <Badge variant="outline">{productLabel}</Badge>
              <Badge variant={done ? "success" : "warning"}>
                {done ? "COMPLETED" : "RUNNING"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {run.agentName} · {run.harness} · {run.model}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Compute: {run.computeSource}
              {projectName ? ` · ${projectName}` : ""}
              {roundTitle ? ` · ${roundTitle}` : ""}
              {" · "}
              ~{Math.round(TARGET_DURATION_MS / 1000 / speed)}s at {speed}x
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setPlaying((p) => !p)}
            disabled={done}
          >
            {playing && !done ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Play
              </>
            )}
          </Button>
          {([1, 2] as const).map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={speed === s ? "primary" : "secondary"}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="accent"
            onClick={() => {
              setCursor(events.length);
              setPlaying(false);
            }}
          >
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
        <div className="space-y-0 p-5">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground animate-pulse-soft">
              Agent starting on AMD GPU…
            </p>
          ) : null}
          <ol>
            {visible.map((event, idx) => {
              const isLast = idx === visible.length - 1 && !done;
              return (
                <li key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {event.type === "RUN_COMPLETED" ||
                    event.type === "TEST_COMPLETED" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle
                        className={cn(
                          "h-4 w-4",
                          isLast
                            ? "text-accent animate-pulse-soft"
                            : "text-muted-foreground"
                        )}
                      />
                    )}
                    {idx < visible.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{event.title}</span>
                      {event.visibility !== "PUBLIC" ? (
                        <Badge variant="outline">{event.visibility}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {event.publicMessage}
                    </p>
                    {role === "FOUNDER" && event.privatePayload ? (
                      <pre className="mt-2 overflow-x-auto rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {JSON.stringify(event.privatePayload, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
          {done ? (
            <div className="mt-2 rounded-2xl border border-success/30 bg-[var(--success-soft)] p-4 animate-reveal-up">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Execution complete
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {run.publicSummary ||
                  "Recorded execution finished. Rewards are ready below."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border bg-muted/20 p-5 lg:border-l lg:border-t-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Run metrics
          </h3>
          <dl className="mt-3 space-y-3 text-sm">
            <Metric
              label="Tokens in/out"
              value={`${formatNumber(run.inputTokens ?? 0)} / ${formatNumber(run.outputTokens ?? 0)}`}
            />
            <Metric
              label="Compute time"
              value={`${formatNumber(run.computeTimeSeconds ?? 0)}s`}
            />
            <Metric
              label="Files changed"
              value={String(run.filesChanged ?? 0)}
            />
            <Metric
              label="Tests"
              value={`${run.testsPassed ?? 0}/${run.testsTotal ?? 0}`}
            />
            <Metric
              label="Commit"
              value={run.commitHash ? run.commitHash.slice(0, 12) : "—"}
            />
          </dl>
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <FileCode2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Private prompts and secrets are never shown.
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
