import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CategoryDonut,
  AssetBar,
} from "@/components/portfolio/allocation-charts";
import { OnboardingCard } from "@/components/investor/onboarding-card";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getGemmaGateway } from "@/lib/gemma";
import { formatNumber } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { GemmaProviderBadge } from "@/components/gemma/provider-badge";
import { RESOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const juror = await requireJuror("/portfolio");
  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);
  const gemma = getGemmaGateway();
  const briefing = await gemma.analyzePortfolio({
    investorId: session.investorId,
  });
  const firstName = juror.displayName.split(" ")[0] || juror.displayName;

  const categoryData = Object.entries(portfolio.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const assetData = [
    { name: "VIBE", value: portfolio.vibeBalance },
    {
      name: "Project Tokens",
      value: portfolio.tokenHoldings.reduce((s, h) => s + (h.simulatedValue ?? h.amount), 0),
    },
    {
      name: "NFTs",
      value: portfolio.nftHoldings.reduce((s, h) => s + (h.simulatedValue ?? 0), 0),
    },
  ].filter((d) => d.value > 0);

  const pending = portfolio.allocations.filter(
    (a) => a.settlementStatus === "PENDING_VERIFICATION"
  );

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Portfolio"
      subtitle={`${firstName}'s capital, compute exposure, and verified progress`}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {!juror.onboardingSeen ? (
          <OnboardingCard firstName={firstName} />
        ) : null}

        {/* Hero */}
        <section className="card-surface card-glow relative overflow-hidden p-6 md:p-8">
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Portfolio value
              </div>
              <div className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {formatNumber(portfolio.simulatedTotal)}
                <span className="ml-2 text-lg font-medium text-muted-foreground">
                  units
                </span>
              </div>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Across {portfolio.investedProjectCount} projects ·{" "}
                {formatNumber(portfolio.vibeBalance)} VIBE available
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/discover"
                  className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-medium text-white shadow-[0_0_24px_rgba(91,140,255,0.25)]"
                >
                  Discover projects
                </Link>
                <Link
                  href="/projects/collabmesh"
                  className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium"
                >
                  Continue CollabMesh
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeroStat label="VIBE" value={formatNumber(portfolio.vibeBalance)} />
              <HeroStat
                label="Positions"
                value={String(portfolio.tokenHoldings.length)}
              />
              <HeroStat label="NFTs" value={String(portfolio.nftHoldings.length)} />
              <HeroStat
                label="Allocations"
                value={String(portfolio.allocations.length)}
              />
            </div>
          </div>
        </section>

        {/* Gemma insight */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-gemma">✦</span> Gemma insight for {firstName}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{briefing.title}</p>
            </div>
            <GemmaProviderBadge
              provider={briefing.provider}
              attribution={
                briefing.provider === "AMD_GEMMA"
                  ? "Gemma 4 · AMD Instinct"
                  : null
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <Markdown content={`${firstName}, ${briefing.summary}`} />
            <div className="grid gap-3 md:grid-cols-2">
              <InsightList title="Watch" items={briefing.risks || []} />
              <InsightList title="Strengths" items={briefing.strengths || []} />
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Exposure by category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryDonut data={categoryData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Asset composition</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetBar data={assetData} />
            </CardContent>
          </Card>
        </div>

        {pending.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Pending verification</CardTitle>
              <Badge variant="pending">{pending.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {pending.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
                >
                  <div>
                    <div className="font-medium">{a.project?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {RESOURCE_LABELS[a.resourceType as keyof typeof RESOURCE_LABELS] ||
                        a.resourceType}{" "}
                      · {formatNumber(a.amount)} · est. {formatNumber(a.rewardTokens)} tokens
                    </div>
                  </div>
                  <Badge variant="pending">Pending</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.tokenHoldings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No project tokens yet. Allocate VIBE from Discover.
                </p>
              ) : (
                portfolio.tokenHoldings.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                  >
                    <div>
                      <div className="font-medium">
                        {h.assetSymbol}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {h.assetName}
                        </span>
                      </div>
                      {h.project ? (
                        <Link
                          href={`/projects/${h.project.slug}`}
                          className="text-xs text-accent hover:underline"
                        >
                          {h.project.name}
                        </Link>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatNumber(h.amount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFTs & access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.nftHoldings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Larger liquid allocations may unlock project NFTs with product access.
                </p>
              ) : (
                portfolio.nftHoldings.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-xl border border-border px-3 py-2.5"
                  >
                    <div className="font-medium">{h.assetName}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.project?.name} · qty {h.amount}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent allocations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolio.allocations.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{a.project?.name || a.projectId}</div>
                    <div className="text-xs text-muted-foreground">
                      {RESOURCE_LABELS[a.resourceType as keyof typeof RESOURCE_LABELS] ||
                        a.resourceType}{" "}
                      · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums">{formatNumber(a.amount)}</div>
                    <SettlementBadge status={a.settlementStatus || "IMMEDIATE"} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
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
              </div>
              <div className="space-y-2">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {portfolio.updates.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Stakeholder updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolio.updates.map((u) => (
                <div key={u.id} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{u.title}</div>
                    <Badge variant="outline">{u.project?.name}</Badge>
                  </div>
                  <div className="mt-2">
                    <Markdown content={u.body.slice(0, 320) + (u.body.length > 320 ? "…" : "")} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
        {items.map((r) => (
          <li key={r}>• {r}</li>
        ))}
      </ul>
    </div>
  );
}

function SettlementBadge({ status }: { status: string }) {
  if (status === "PENDING_VERIFICATION") return <Badge variant="pending">Pending</Badge>;
  if (status === "REWARD_RELEASED" || status === "VERIFIED")
    return <Badge variant="success">Released</Badge>;
  return <Badge variant="success">Immediate</Badge>;
}
