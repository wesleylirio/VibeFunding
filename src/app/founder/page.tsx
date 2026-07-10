import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getFounderDashboard } from "@/lib/queries/founder";
import { getPortfolio } from "@/lib/queries/portfolio";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FounderDashboardPage() {
  const juror = await requireJuror("/founder");
  const session = getDemoSession();
  const dash = getFounderDashboard(session.founderId);
  const portfolio = getPortfolio(session.investorId);

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Founder dashboard"
      subtitle="Projects, rounds, agents, proofs and stakeholder updates"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="card-surface flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="font-semibold">Create a project with Gemma</div>
            <p className="text-sm text-muted-foreground">
              Four questions → full Build Round draft. You stay in control.
            </p>
          </div>
          <Link
            href="/founder/quickstart"
            className="inline-flex h-10 items-center rounded-xl bg-gemma px-4 text-sm font-medium text-neutral-950"
          >
            Open Quickstart
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Projects" value={String(dash.projects.length)} />
          <Stat label="Build Rounds" value={String(dash.rounds.length)} />
          <Stat
            label="Resources captured"
            value={`${formatNumber(dash.fundedTotal)} / ${formatNumber(dash.targetTotal)}`}
          />
          <Stat label="Pending updates" value={String(dash.pendingUpdates.length)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dash.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/founder/projects/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 hover:border-accent"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                      style={{ background: p.accentColor }}
                    >
                      {p.logoEmoji}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.stage}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gemma alerts</CardTitle>
              <Badge variant="gemma">Demo</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Review clarity on open Build Rounds before pushing to investors.</p>
              <p>• A draft stakeholder update is waiting for approval on CollabMesh.</p>
              <p>• Recent Proof of Build is HASH_VERIFIED — consider publishing a short update.</p>
              <p className="text-xs">
                Gemma assists communication. It does not control your roadmap or publish without you.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Agent runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dash.runs.map((r) => (
                <Link
                  key={r.id}
                  href={`/founder/projects/${r.projectId}/runs`}
                  className="block rounded-lg border border-border px-3 py-2 text-sm hover:border-accent"
                >
                  <div className="font-medium">{r.taskTitle}</div>
                  <div className="text-xs text-muted-foreground">{r.status}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Proofs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dash.proofs.map((p) => (
                <Link
                  key={p.id}
                  href={`/proofs/${p.id}`}
                  className="block rounded-lg border border-border px-3 py-2 text-sm hover:border-accent"
                >
                  <div className="font-medium">{p.taskTitle}</div>
                  <div className="text-xs text-muted-foreground">{p.verificationStatus}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dash.updates.map((u) => (
                <div key={u.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{u.title}</span>
                    <Badge variant={u.status === "PUBLISHED" ? "success" : "outline"}>
                      {u.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Link
                href={`/founder/projects/${dash.projects[0]?.id}/stakeholder-update`}
                className="inline-flex text-sm font-medium text-accent hover:underline"
              >
                Generate stakeholder update →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
