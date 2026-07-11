import Link from "next/link";
import { Activity, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCompact } from "@/lib/utils";

export function ProjectCard({
  project,
  matchReason,
  matchFactors,
  mainRisk,
  gemmaSuggestion = false,
}: {
  project: {
    id?: string;
    slug: string;
    name: string;
    shortDescription: string;
    category: string;
    stage: string;
    logoEmoji: string;
    accentColor: string;
    detailed: boolean;
    proofCount: number;
    returnTitles: string[];
    activeRound: {
      title: string;
      status: string;
      progress: number;
      fundedValue: number;
      targetValue: number;
    } | null;
  };
  matchReason?: string;
  matchFactors?: string[];
  mainRisk?: string;
  /** Discrete badge — Gemma pick (same grid as everyone else) */
  gemmaSuggestion?: boolean;
}) {
  const cover = `linear-gradient(135deg, ${project.accentColor}50, transparent 55%), linear-gradient(180deg, var(--surface-3), var(--surface-1))`;
  const showGemma = gemmaSuggestion || Boolean(matchReason);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card-surface group flex flex-col overflow-hidden vf-transition hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative h-28 project-cover" style={{ background: cover }}>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-end gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-lg ring-2 ring-black/15"
            style={{ background: project.accentColor }}
          >
            {project.logoEmoji}
          </div>
        </div>
        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
          {showGemma ? (
            <span className="rounded-full border border-gemma/30 bg-gemma-soft/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gemma backdrop-blur">
              Gemma suggestion
            </span>
          ) : null}
          {project.proofCount > 0 ? (
            <Badge variant="success" className="backdrop-blur">
              <ShieldCheck className="mr-1 h-3 w-3" />
              {project.proofCount} proof{project.proofCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display font-semibold tracking-tight group-hover:text-primary">
            {project.name}
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {project.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{project.category}</Badge>
          <Badge variant="outline">{project.stage}</Badge>
        </div>

        {matchReason ? (
          <p className="mt-2 text-[11px] leading-relaxed text-gemma">
            {matchReason}
          </p>
        ) : null}

        {matchFactors && matchFactors.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {matchFactors.map((f) => (
              <span
                key={f}
                className="rounded-full bg-gemma-soft px-2 py-0.5 text-[10px] font-medium text-gemma"
              >
                {f}
              </span>
            ))}
          </div>
        ) : null}

        {mainRisk ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Main risk: {mainRisk}
          </p>
        ) : null}

        {project.activeRound ? (
          <div className="mt-4 rounded-[var(--vf-radius-sm)] border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="line-clamp-1 font-medium">
                {project.activeRound.title}
              </span>
              <Badge variant="warning">{project.activeRound.status}</Badge>
            </div>
            <Progress
              className="mt-2"
              value={project.activeRound.progress}
              color={project.accentColor}
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="tabular-nums">
                {formatCompact(project.activeRound.fundedValue)} /{" "}
                {formatCompact(project.activeRound.targetValue)} BU
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3 w-3 text-teal" />
                {project.activeRound.progress}%
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-muted-foreground">
            No active Build Round
          </div>
        )}

        {project.returnTitles.length > 0 && !matchReason ? (
          <div className="mt-3 text-[11px] text-muted-foreground">
            Benefits: {project.returnTitles.slice(0, 2).join(" · ")}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
