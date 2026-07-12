import Link from "next/link";
import { ArrowUpRight, BrainCircuit, CircleAlert, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { GemmaOrb } from "@/components/gemma/gemma-orb";
import { GemmaPanel } from "@/components/gemma/gemma-panel";
import { GemmaProviderBadge } from "@/components/gemma/provider-badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getGemmaGateway } from "@/lib/gemma";
import { listProjects } from "@/lib/queries/projects";
import { formatNumber } from "@/lib/utils";
import { liveAttribution } from "@/lib/gemma/openai-client";

export const dynamic = "force-dynamic";

export default async function GemmaPage() {
  const juror = await requireJuror("/gemma");
  const session = await getDemoSession();
  const portfolio = await getPortfolio(session.investorId);
  const briefing = await getGemmaGateway().analyzePortfolio({
    investorId: session.investorId,
  });
  const { items } = await listProjects({ sort: "TRENDING", limit: 6 });
  const matches = items.filter((p) => p.detailed || p.proofCount > 0).slice(0, 3);
  const rawFirstName = juror.displayName.split(" ")[0] || juror.displayName;
  const firstName = /[\p{L}\p{N}]/u.test(rawFirstName) ? rawFirstName : "Investor";
  const pendingCount = portfolio.allocations.filter(
    (a) => a.settlementStatus === "PENDING_VERIFICATION"
  ).length;

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Gemma"
      vibeBalance={portfolio.vibeBalance}
      hideGemma
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="card-surface card-glow p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GemmaOrb size={48} state="reporting" />
              <div>
                <div className="text-xs font-medium tracking-[0.14em] text-gemma">
                  Decision intelligence
                </div>
                <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  Hello {firstName} — here is what matters
                </h1>
              </div>
            </div>
            <GemmaProviderBadge
              provider={briefing.provider}
              attribution={briefing.provider === "AMD_GEMMA" ? liveAttribution() : null}
            />
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            A live decision room for signals, diligence, and evidence. Gemma advises,
            but never invests on your behalf.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-gemma">
                    <BrainCircuit className="h-4 w-4" /> Live synthesis
                  </div>
                  <CardTitle className="mt-2 text-xl">{briefing.title}</CardTitle>
                </div>
                <Badge variant="gemma">Personalized</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="text-sm leading-6 text-muted-foreground">
                  <Markdown content={briefing.summary} />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Portfolio" value={formatNumber(portfolio.simulatedTotal)} />
                  <Stat label="VIBE free" value={formatNumber(portfolio.vibeBalance)} />
                  <Stat label="Projects" value={String(portfolio.investedProjectCount)} />
                  <Stat label="Proofs" value={String(portfolio.recentProofs.length)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal board</CardTitle>
                <Badge variant={pendingCount ? "warning" : "success"}>
                  {pendingCount ? `${pendingCount} need attention` : "No blockers"}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <SignalList
                  icon={<CircleAlert className="h-4 w-4" />}
                  title="Watch closely"
                  items={briefing.risks || []}
                />
                <SignalList
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Conviction signals"
                  items={briefing.strengths || []}
                />
                <div className="rounded-xl border border-gemma/20 bg-gemma/5 p-4 sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gemma">
                    Questions worth asking
                  </div>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    {(briefing.questions || []).map((question) => (
                      <li key={question}>→ {question}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-[560px] overflow-hidden">
            <div className="h-[560px]">
              <GemmaPanel compact />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Opportunity radar</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Candidates with execution evidence or an active funding signal.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {matches.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group rounded-xl border border-border p-4 hover:border-gemma/40 hover:bg-gemma/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ background: project.accentColor }}
                  >
                    {project.logoEmoji}
                  </div>
                  <Badge variant="outline">{project.stage}</Badge>
                </div>
                <div className="mt-3 font-medium group-hover:text-gemma">{project.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.shortDescription}
                </p>
                <p className="mt-3 text-xs text-gemma">
                  {project.proofCount > 0
                    ? `${project.proofCount} Proof${project.proofCount === 1 ? "" : "s"} on record`
                    : "Active Build Round"}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Evidence stream</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                What changed, backed by recorded activity.
              </p>
            </div>
            <Link href="/activity" className="flex items-center gap-1 text-xs font-medium text-gemma hover:underline">
              Full activity <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Allocations
              </div>
              {portfolio.allocations.slice(0, 4).map((allocation) => (
                <div key={allocation.id} className="flex justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
                  <span>Allocated to <span className="font-medium">{allocation.project?.name}</span></span>
                  <span className="text-muted-foreground">{new Date(allocation.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-border p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Verified output
              </div>
              {portfolio.recentProofs.map((proof) => (
                <Link key={proof.id} href={`/proofs/${proof.id}`} className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0 hover:text-gemma">
                  <span className="line-clamp-1">{proof.taskTitle}</span>
                  <Badge variant="outline">{proof.testsPassed}/{proof.testsTotal} tests</Badge>
                </Link>
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
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SignalList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}{title}
      </div>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        {items.slice(0, 3).map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
