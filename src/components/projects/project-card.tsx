import Link from "next/link";
import { Activity, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCompact } from "@/lib/utils";

export function ProjectCard({
  project,
  matchReason,
}: {
  project: {
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
}) {
  const cover = `linear-gradient(135deg, ${project.accentColor}55, transparent 55%), linear-gradient(180deg, #141822, #0c0e14)`;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card-surface group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-white/15"
    >
      <div
        className="relative h-28 project-cover"
        style={{ background: cover }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-end gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl text-white shadow-lg ring-2 ring-black/20"
            style={{ background: project.accentColor }}
          >
            {project.logoEmoji}
          </div>
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
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
          <h3 className="font-semibold tracking-tight group-hover:text-accent">
            {project.name}
          </h3>
          {matchReason ? (
            <Badge variant="gemma">
              <Sparkles className="mr-1 h-3 w-3" /> Match
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {project.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline">{project.category}</Badge>
          <Badge variant="outline">{project.stage}</Badge>
        </div>

        {matchReason ? (
          <p className="mt-2 text-[11px] text-gemma">{matchReason}</p>
        ) : null}

        {project.activeRound ? (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium line-clamp-1">
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
              <span>
                {formatCompact(project.activeRound.fundedValue)} /{" "}
                {formatCompact(project.activeRound.targetValue)} BU
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3 w-3 text-success" />
                {project.activeRound.progress}%
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-muted-foreground">No active Build Round</div>
        )}

        {project.returnTitles.length > 0 ? (
          <div className="mt-3 text-[11px] text-muted-foreground">
            Returns: {project.returnTitles.slice(0, 2).join(" · ")}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
