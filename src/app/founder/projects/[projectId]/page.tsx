import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuildRoundEditor } from "@/components/founder/build-round-editor";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getFounderProject } from "@/lib/queries/founder";
import { getPortfolio } from "@/lib/queries/portfolio";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FounderProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const juror = await requireJuror(`/founder/projects/${projectId}`);
  const session = getDemoSession();
  const project = getFounderProject(projectId);
  if (!project) notFound();
  const portfolio = getPortfolio(session.investorId);

  const draftRound = project.rounds.find((r) => r.status === "DRAFT");
  const editable = draftRound || project.rounds[0];

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={project.name}
      subtitle="Founder workspace"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-accent hover:underline"
          >
            Investor view →
          </Link>
          <Link
            href={`/founder/projects/${project.id}/runs`}
            className="text-sm text-muted-foreground hover:underline"
          >
            Agent workspace
          </Link>
          <Link
            href={`/founder/projects/${project.id}/stakeholder-update`}
            className="text-sm text-muted-foreground hover:underline"
          >
            Stakeholder update
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project snapshot</CardTitle>
            <Badge variant="outline">{project.visibility}</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{project.description.split("\n\n")[0]}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
            <p>
              Token: {project.tokenSymbol || "—"} · Stage: {project.stage}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Rounds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.rounds.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.title}</span>
                  <Badge variant={r.status === "DRAFT" ? "outline" : "warning"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{r.objective}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(r.fundedValue)} / {formatNumber(r.targetValue)} simulated units
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <BuildRoundEditor
          projectId={project.id}
          initial={
            editable
              ? {
                  id: editable.id,
                  title: editable.title,
                  objective: editable.objective,
                  targetValue: editable.targetValue,
                  expectedDeliverables: editable.expectedDeliverables,
                  risks: editable.risks,
                  publicSummary: editable.publicSummary || "",
                }
              : {
                  title: "New Build Round",
                  objective: "",
                  targetValue: 10000,
                  expectedDeliverables: [],
                  risks: [],
                  publicSummary: "",
                }
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Proofs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.proofs.map((p) => (
                <Link
                  key={p.id}
                  href={`/proofs/${p.id}`}
                  className="block text-sm text-accent hover:underline"
                >
                  {p.taskTitle}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {project.updates.map((u) => (
                <div key={u.id} className="flex justify-between gap-2">
                  <span>{u.title}</span>
                  <Badge variant="outline">{u.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
