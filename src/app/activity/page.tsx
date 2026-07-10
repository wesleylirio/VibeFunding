import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { RESOURCE_LABELS } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const juror = await requireJuror("/activity");
  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Activity"
      subtitle="Allocations, proofs, agents, and updates"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Allocations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {portfolio.allocations.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{a.project?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {RESOURCE_LABELS[a.resourceType as keyof typeof RESOURCE_LABELS] ||
                      a.resourceType}{" "}
                    · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="tabular-nums">{formatNumber(a.amount)}</div>
                  <Badge
                    variant={
                      a.settlementStatus === "PENDING_VERIFICATION"
                        ? "pending"
                        : "success"
                    }
                  >
                    {a.settlementStatus === "PENDING_VERIFICATION"
                      ? "Pending"
                      : a.settlementStatus === "REWARD_RELEASED"
                        ? "Released"
                        : "Immediate"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proofs of Build</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {portfolio.recentProofs.map((p) => (
              <Link
                key={p.id}
                href={`/proofs/${p.id}`}
                className="block rounded-xl border border-border px-3 py-2 text-sm hover:border-accent/40"
              >
                <div className="font-medium">{p.taskTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {p.project?.name} · {p.verificationStatus}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {portfolio.recentRuns.map((r) => (
              <Link
                key={r.id}
                href={`/projects/${r.project?.slug}/agents`}
                className="block rounded-xl border border-border px-3 py-2 text-sm hover:border-accent/40"
              >
                <div className="font-medium">{r.taskTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {r.project?.name} · {r.status}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stakeholder updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {portfolio.updates.map((u) => (
              <div key={u.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="font-medium">{u.title}</div>
                <div className="text-xs text-muted-foreground">{u.project?.name}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
