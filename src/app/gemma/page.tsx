import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getGemmaGateway } from "@/lib/gemma";
import { listProjects } from "@/lib/queries/projects";
import { Markdown } from "@/components/ui/markdown";
import { formatNumber } from "@/lib/utils";
import { GemmaOrb } from "@/components/gemma/gemma-orb";
import { GemmaProviderBadge } from "@/components/gemma/provider-badge";
import { liveAttribution } from "@/lib/gemma/openai-client";

export const dynamic = "force-dynamic";

export default async function GemmaPage() {
  const juror = await requireJuror("/gemma");
  const session = await getDemoSession();
  const portfolio = await getPortfolio(session.investorId);
  const gateway = getGemmaGateway();
  const briefing = await gateway.analyzePortfolio({
    investorId: session.investorId,
  });
  const { items } = listProjects({ sort: "TRENDING", limit: 6 });
  const matches = items.filter((p) => p.detailed || p.proofCount > 0).slice(0, 3);
  const firstName = juror.displayName.split(" ")[0] || juror.displayName;

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Gemma"
      vibeBalance={portfolio.vibeBalance}
      hideGemma
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card-surface card-glow p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GemmaOrb size={48} state="reporting" />
              <div>
                <div className="text-xs font-medium tracking-[0.14em] text-gemma">
                  Portfolio intelligence
                </div>
                <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  Hello {firstName} — here is what matters
                </h1>
              </div>
            </div>
            <GemmaProviderBadge
              provider={briefing.provider}
              attribution={
                briefing.provider === "AMD_GEMMA"
                  ? liveAttribution()
                  : null
              }
            />
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Personalized briefings, matches, and reports from Gemma. Advice only —
            Gemma never auto-invests.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Your Briefing</CardTitle>
            <Badge variant="gemma">Personalized</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Markdown content={`${firstName}, ${briefing.summary}`} />
            <div className="grid gap-2 sm:grid-cols-3">
              <ReportChip
                label="Proofs published"
                value={String(portfolio.recentProofs.length)}
              />
              <ReportChip
                label="Open attention"
                value={
                  portfolio.allocations.some(
                    (a) => a.settlementStatus === "PENDING_VERIFICATION"
                  )
                    ? "Pending contributions"
                    : "None"
                }
              />
              <ReportChip
                label="Positions"
                value={String(portfolio.tokenHoldings.length)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Intelligence</CardTitle>
            <Badge variant="outline">Concentration & assets</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Portfolio units" value={formatNumber(portfolio.simulatedTotal)} />
              <Stat label="VIBE free" value={formatNumber(portfolio.vibeBalance)} />
              <Stat label="Projects" value={String(portfolio.investedProjectCount)} />
              <Stat label="Recent proofs" value={String(portfolio.recentProofs.length)} />
            </div>
            <Markdown content={briefing.summary} />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Risks
                </div>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {(briefing.risks || []).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent proofs
                </div>
                <ul className="mt-1 space-y-1 text-sm">
                  {portfolio.recentProofs.map((p) => (
                    <li key={p.id}>
                      <Link href={`/proofs/${p.id}`} className="text-accent hover:underline">
                        {p.taskTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border p-3 hover:border-gemma/40"
              >
                <div className="flex gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ background: p.accentColor }}
                  >
                    {p.logoEmoji}
                  </div>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <p className="text-sm text-muted-foreground">{p.shortDescription}</p>
                    <p className="mt-1 text-xs text-gemma">
                      {p.proofCount > 0
                        ? "Matched: verified Proof of Build evidence"
                        : "Matched: active Build Round fit for your profile"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{p.stage}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Weekly portfolio brief
              </div>
              <h3 className="mt-1 text-lg font-semibold">Execution over promises</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                CollabMesh led activity with a hash-verified Proof of Build. InferLane
                remains open for GPU hours and VIBE. Concentration in developer tools is
                elevated — consider Security (AuditForge) for balance.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <ReportChip label="Top mover" value="CollabMesh" />
                <ReportChip label="Open rounds" value="3+" />
                <ReportChip label="Proofs this week" value={String(portfolio.recentProofs.length)} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Event timeline
              </div>
              {portfolio.allocations.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between border-b border-border py-2 text-sm last:border-0"
                >
                  <span>
                    Allocated to <span className="font-medium">{a.project?.name}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ReportChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
