import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AgentReplay } from "@/components/agents/agent-replay";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getFounderProject } from "@/lib/queries/founder";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getRunWithEvents } from "@/lib/queries/agents";

export const dynamic = "force-dynamic";

export default async function FounderRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const juror = await requireJuror(`/founder/projects/${projectId}/runs`);
  const session = getDemoSession();
  const project = getFounderProject(projectId);
  if (!project) notFound();
  const portfolio = getPortfolio(session.investorId);

  const primaryRun = project.runs[0];
  const bundle = primaryRun
    ? getRunWithEvents(primaryRun.id, "FOUNDER")
    : null;

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Agent workspace"
      subtitle={`${project.name} · founder visibility`}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/founder/projects/${project.id}`}
            className="text-sm text-accent hover:underline"
          >
            ← Project
          </Link>
          <Badge variant="outline">FOUNDER_ONLY events visible</Badge>
          <Link
            href={`/projects/${project.slug}/agents`}
            className="text-sm text-muted-foreground hover:underline"
          >
            Preview investor view
          </Link>
        </div>

        {bundle?.run ? (
          <AgentReplay
            run={bundle.run}
            events={bundle.events}
            proofId={bundle.proof?.id}
            role="FOUNDER"
            projectName={project.name}
            accentColor={project.accentColor}
          />
        ) : (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No runs for this project.
          </div>
        )}
      </div>
    </AppShell>
  );
}
