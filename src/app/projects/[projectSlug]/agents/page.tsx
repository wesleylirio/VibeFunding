import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AgentReplay } from "@/components/agents/agent-replay";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getRunByProjectSlug, listProjectRuns } from "@/lib/queries/agents";
import { getProjectBySlug } from "@/lib/queries/projects";
import { ProjectTabs } from "@/components/projects/project-tabs";

export const dynamic = "force-dynamic";

export default async function ProjectAgentsPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const juror = await requireJuror(`/projects/${projectSlug}/agents`);
  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const bundle = getRunByProjectSlug(projectSlug, juror.role);
  const runs = listProjectRuns(project.id);
  const round = project.rounds.find((r) => r.id === bundle?.run?.buildRoundId);

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={`${project.name} · Agents`}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <ProjectTabs slug={project.slug} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-accent hover:underline"
          >
            ← Back to project
          </Link>
          <div className="flex gap-2">
            <Badge variant="outline">Recorded execution</Badge>
            {round ? <Badge variant="accent">{round.title}</Badge> : null}
          </div>
        </div>

        <div className="card-surface p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">How contribution activates work: </span>
          Investment → Agents execute → Proof of Build. This view is an execution
          replay — private prompts stay hidden.
        </div>

        {bundle?.run ? (
          <AgentReplay
            run={bundle.run}
            events={bundle.events}
            role={session.role}
            projectName={project.name}
            accentColor={project.accentColor}
            roundTitle={round?.title}
          />
        ) : (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No agent runs available for this project.
          </div>
        )}

        {runs.length > 1 ? (
          <div className="card-surface p-4">
            <h3 className="text-sm font-semibold">Other runs</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {runs.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between border-b border-border py-2 last:border-0"
                >
                  <span>{r.taskTitle}</span>
                  <span className="text-muted-foreground">{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
