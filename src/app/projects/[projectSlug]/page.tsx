import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AllocateButton } from "@/components/investor/allocate-button";
import { OnePaperModal } from "@/components/projects/one-paper-modal";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getProjectBySlug } from "@/lib/queries/projects";
import { getPortfolio } from "@/lib/queries/portfolio";
import { formatMetric, formatNumber } from "@/lib/utils";
import {
  VIBE_AMD_CONVERSION_LABEL,
  formatAmdGpuHours,
  vibeToAmdGpuHours,
} from "@/lib/resources/conversion";

export const dynamic = "force-dynamic";

/**
 * Demo project page: understand → stats → invest → proof / last builds.
 * Community only after invest.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const juror = await requireJuror(`/projects/${projectSlug}`);
  const session = getDemoSession();
  const project = getProjectBySlug(projectSlug);
  if (!project) notFound();

  const portfolio = getPortfolio(session.investorId);

  const hasInvested =
    portfolio.allocations.some((a) => a.projectId === project.id) ||
    portfolio.holdings.some(
      (h) =>
        h.projectId === project.id &&
        (h.assetType === "PROJECT_TOKEN" || h.assetType === "NFT")
    );

  const activeRound =
    project.rounds.find((r) =>
      ["OPEN", "BUILDING", "FUNDED"].includes(r.status)
    ) || project.rounds[0];

  const previousRounds = project.rounds.filter(
    (r) =>
      r.status === "COMPLETED" || (activeRound ? r.id !== activeRound.id : true)
  );

  const storyBlurb =
    project.description
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean)[0] || project.shortDescription;

  const metricEntries = Object.entries(project.metrics).slice(0, 4);

  const cover = `linear-gradient(120deg, ${project.accentColor}55, transparent 55%), radial-gradient(700px 280px at 90% 10%, color-mix(in oklab, var(--gemma) 18%, transparent), transparent), var(--card)`;

  const vibeTarget =
    activeRound?.resources.find((r) => r.type === "VIBE")?.targetAmount ??
    activeRound?.targetValue ??
    0;
  const vibeFunded =
    activeRound?.resources.find((r) => r.type === "VIBE")?.fundedAmount ??
    activeRound?.fundedValue ??
    0;

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={project.name}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <ProjectTabs
          slug={project.slug}
          showCommunity={hasInvested}
          onePaper={
            <OnePaperModal
              project={project}
              activeRound={activeRound}
              trigger="tab"
            />
          }
        />

        {/* 1 · Hero */}
        <section
          className="card-surface relative overflow-hidden"
          style={{ background: cover }}
        >
          <div className="relative z-10 space-y-5 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
                style={{ background: project.accentColor }}
              >
                {project.logoEmoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                    {project.name}
                  </h1>
                  {project.tokenSymbol ? (
                    <Badge variant="vibe">${project.tokenSymbol}</Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                  {project.shortDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{project.category}</Badge>
                  <Badge variant="outline">{project.stage}</Badge>
                </div>
              </div>
            </div>

            {/* Stats — compact chips */}
            {(metricEntries.length > 0 || project.proofs.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {metricEntries.map(([k, v]) => {
                  const m = formatMetric(k, v);
                  return (
                    <div key={k} className="metric-chip">
                      <span className="value">{m.display}</span>
                      <span className="label">{m.label}</span>
                    </div>
                  );
                })}
                {project.proofs.length > 0 ? (
                  <div className="metric-chip">
                    <span className="value">{project.proofs.length}</span>
                    <span className="label">proofs</span>
                  </div>
                ) : null}
              </div>
            )}

            {activeRound ? (
              <AllocateButton
                buildRoundId={activeRound.id}
                projectId={project.id}
                projectName={project.name}
                roundTitle={activeRound.title}
                tokenSymbol={project.tokenSymbol}
                vibeBalance={portfolio.vibeBalance}
                label="Invest with VIBE"
                deliverables={activeRound.expectedDeliverables}
                objective={activeRound.objective}
                primaryProofId={project.proofs[0]?.id}
              />
            ) : null}
          </div>
        </section>

        {/* 2 · What they build */}
        <section className="card-surface p-5 md:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            What they build
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {storyBlurb}
          </p>
          {project.founder?.name ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Founder ·{" "}
              <span className="font-medium text-foreground">
                {project.founder.name}
              </span>
            </p>
          ) : null}
        </section>

        {/* 3 · Build Round */}
        {activeRound ? (
          <section id="build-round" className="scroll-mt-24 space-y-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Invest in this Build Round
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your VIBE funds AMD GPU for agents. You earn{" "}
                {project.tokenSymbol ? `$${project.tokenSymbol} ` : ""}
                project tokens.
              </p>
            </div>

            <Card className="overflow-hidden border-border">
              <div
                className="h-1"
                style={{
                  background: `linear-gradient(90deg, ${project.accentColor}, transparent)`,
                }}
              />
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {activeRound.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeRound.objective}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activeRound.status === "COMPLETED" ? "success" : "warning"
                    }
                  >
                    {activeRound.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Funded</span>
                    <span className="tabular-nums">
                      {formatNumber(vibeFunded)} / {formatNumber(vibeTarget)}{" "}
                      VIBE · {activeRound.progress}%
                    </span>
                  </div>
                  <Progress
                    value={activeRound.progress}
                    color={project.accentColor}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-compute">
                      {VIBE_AMD_CONVERSION_LABEL}
                    </span>
                    {vibeTarget > 0 ? (
                      <>
                        {" "}
                        · Target ≈{" "}
                        {formatAmdGpuHours(vibeToAmdGpuHours(vibeTarget))}
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      This round builds
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {activeRound.expectedDeliverables.slice(0, 4).map((d) => (
                        <li key={d}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      You may receive
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {activeRound.returns.slice(0, 3).map((r) => (
                        <li key={r.id}>• {r.title}</li>
                      ))}
                      {activeRound.returns.length === 0 ? (
                        <li>• Project tokens from Build Units</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    {hasInvested ? (
                      <>
                        You&apos;re in · open{" "}
                        <Link
                          href={`/projects/${project.slug}/community`}
                          className="font-medium text-accent hover:underline"
                        >
                          Community
                        </Link>
                      </>
                    ) : (
                      <>
                        Ask <span className="text-gemma">Gemma</span> for risks
                        — badge <strong className="text-foreground">1</strong>{" "}
                        on the orb.
                      </>
                    )}
                  </p>
                  <AllocateButton
                    buildRoundId={activeRound.id}
                    projectId={project.id}
                    projectName={project.name}
                    roundTitle={activeRound.title}
                    tokenSymbol={project.tokenSymbol}
                    vibeBalance={portfolio.vibeBalance}
                    label="Invest with VIBE"
                    deliverables={activeRound.expectedDeliverables}
                    objective={activeRound.objective}
                    primaryProofId={project.proofs[0]?.id}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {/* 4 · Proof of Build */}
        <section id="evidence" className="scroll-mt-24 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h2 className="font-display text-lg font-semibold">
              Proof of Build
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Verified work — tests, files, hashes.
          </p>

          {project.proofs.length === 0 ? (
            <div className="card-surface p-5 text-sm text-muted-foreground">
              No Proof of Build published yet.
            </div>
          ) : (
            <div className="space-y-2">
              {project.proofs.map((p) => (
                <Link
                  key={p.id}
                  href={`/proofs/${p.id}`}
                  className="card-surface flex items-center justify-between gap-3 p-4 transition hover:border-border-strong"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {p.taskTitle}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.filesChanged} files · {p.testsPassed}/{p.testsTotal}{" "}
                      tests
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="success">{p.verificationStatus}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 5 · Last builds */}
        {previousRounds.length > 0 ? (
          <section id="history" className="scroll-mt-24 space-y-3">
            <h2 className="font-display text-lg font-semibold">Last builds</h2>
            <p className="text-sm text-muted-foreground">
              Previous rounds and what they delivered.
            </p>
            <div className="space-y-2">
              {previousRounds.slice(0, 3).map((round) => (
                <div key={round.id} className="card-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{round.title}</div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {round.objective}
                      </p>
                    </div>
                    <Badge
                      variant={
                        round.status === "COMPLETED" ? "success" : "outline"
                      }
                    >
                      {round.status}
                    </Badge>
                  </div>
                  {round.expectedDeliverables.length > 0 ? (
                    <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      {round.expectedDeliverables.slice(0, 2).map((d) => (
                        <li key={d}>• {d}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatNumber(round.fundedValue)} /{" "}
                    {formatNumber(round.targetValue)} VIBE raised
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!hasInvested ? (
          <p className="text-center text-xs text-muted-foreground">
            Community unlocks after you invest in this project.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
