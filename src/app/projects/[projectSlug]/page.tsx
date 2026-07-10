import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  Play,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AllocateButton } from "@/components/investor/allocate-button";
import { OnePaperModal } from "@/components/projects/one-paper-modal";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ProjectSocialLinks } from "@/components/projects/social-links";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getProjectBySlug } from "@/lib/queries/projects";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getGemmaGateway } from "@/lib/gemma";
import { formatMetric, formatNumber } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { GemmaProviderBadge } from "@/components/gemma/provider-badge";

export const dynamic = "force-dynamic";

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
  const gateway = getGemmaGateway();
  const diligence = await gateway.analyzeProject({ projectId: project.id });

  const activeRound =
    project.rounds.find((r) =>
      ["OPEN", "BUILDING", "FUNDED"].includes(r.status)
    ) || project.rounds[0];

  const story = project.description.split("\n\n");
  const cover = `linear-gradient(120deg, ${project.accentColor}66, transparent 50%), radial-gradient(800px 300px at 80% 20%, rgba(167,139,250,0.25), transparent), #0a0c12`;

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title={project.name}
      subtitle={project.shortDescription}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <ProjectTabs slug={project.slug} />

        {/* Hero */}
        <section
          className="card-surface relative overflow-hidden"
          style={{ background: cover }}
        >
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white shadow-xl ring-2 ring-white/10"
                  style={{ background: project.accentColor }}
                >
                  {project.logoEmoji}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                      {project.name}
                    </h1>
                    {project.tokenSymbol ? (
                      <Badge variant="vibe">${project.tokenSymbol}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-white/75 md:text-base">
                    {project.shortDescription}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">{project.category}</Badge>
                    <Badge variant="outline">{project.stage}</Badge>
                    <Badge variant="success">{project.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {project.founder?.name}
                    </span>
                    {project.repositoryUrl ? (
                      <a
                        href={project.repositoryUrl}
                        className="inline-flex items-center gap-1 hover:text-white"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Repo
                      </a>
                    ) : null}
                    <ProjectSocialLinks links={project.socialLinks} light />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeRound ? (
                  <AllocateButton
                    buildRoundId={activeRound.id}
                    projectId={project.id}
                    projectName={project.name}
                    roundTitle={activeRound.title}
                    tokenSymbol={project.tokenSymbol}
                    vibeBalance={portfolio.vibeBalance}
                    label="Allocate"
                  />
                ) : null}
                {project.runs[0] ? (
                  <Link
                    href={`/projects/${project.slug}/agents`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-4 text-sm font-medium backdrop-blur"
                  >
                    <Play className="h-3.5 w-3.5" /> Watch agents
                  </Link>
                ) : null}
                <div id="one-paper">
                  <OnePaperModal project={project} activeRound={activeRound} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media gallery placeholders */}
        <section className="grid gap-3 sm:grid-cols-3">
          {["Product surface", "Agent workspace", "Live metrics"].map((label, i) => (
            <div
              key={label}
              className="flex h-32 items-end rounded-2xl border border-border p-4"
              style={{
                background: `linear-gradient(${120 + i * 40}deg, ${project.accentColor}33, #10131a)`,
              }}
            >
              <span className="text-xs font-medium text-white/70">{label}</span>
            </div>
          ))}
        </section>

        {/* Signals */}
        <section className="flex flex-wrap gap-2">
          {Object.entries(project.metrics).map(([k, v]) => {
            const m = formatMetric(k, v);
            return (
              <div key={k} className="metric-chip">
                <span className="value">{m.display}</span>
                <span className="label">{m.label}</span>
              </div>
            );
          })}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Project story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {story.map((para, i) => (
                <div key={i}>
                  {i === 0 ? (
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Product
                    </div>
                  ) : i === 1 ? (
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Why this Build Round
                    </div>
                  ) : null}
                  <p className="text-sm leading-relaxed text-muted-foreground">{para}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.techStack.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div id="team" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {(project.founder?.name || "F")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{project.founder?.name}</div>
                    <div className="text-xs text-muted-foreground">Founder</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.founder?.bio || "Builder shipping agentic products."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Gemma due diligence</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{diligence.title}</p>
            </div>
            <GemmaProviderBadge
              provider={diligence.provider}
              attribution={
                diligence.provider === "AMD_GEMMA"
                  ? "Gemma 4 · AMD Instinct"
                  : null
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <Markdown content={diligence.summary} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Risks
                </div>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {(diligence.risks || project.risks).map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Strengths
                </div>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {(diligence.strengths || []).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Build Rounds */}
        <section id="build-rounds" className="space-y-3 scroll-mt-24">
          <h2 className="text-base font-semibold">Build Rounds</h2>
          <div className="grid gap-4">
            {project.rounds.map((round) => (
              <Card key={round.id} className="overflow-hidden">
                <div
                  className="h-1"
                  style={{
                    background: `linear-gradient(90deg, ${project.accentColor}, transparent)`,
                  }}
                />
                <CardHeader>
                  <div>
                    <CardTitle>{round.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{round.objective}</p>
                  </div>
                  <Badge
                    variant={
                      round.status === "COMPLETED"
                        ? "success"
                        : round.status === "DRAFT"
                          ? "outline"
                          : "warning"
                    }
                  >
                    {round.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Funding progress (Build Units)</span>
                      <span>
                        {formatNumber(round.fundedValue)} /{" "}
                        {formatNumber(round.targetValue)} · {round.progress}%
                      </span>
                    </div>
                    <Progress value={round.progress} color={project.accentColor} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MiniBlock title="Deliverables">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {round.expectedDeliverables.slice(0, 3).map((d) => (
                          <li key={d}>• {d}</li>
                        ))}
                      </ul>
                    </MiniBlock>
                    <MiniBlock title="Resources">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {round.resources.map((r) => (
                          <li key={r.id}>
                            • {r.label}: {formatNumber(r.fundedAmount)}/
                            {formatNumber(r.targetAmount)}
                          </li>
                        ))}
                      </ul>
                    </MiniBlock>
                    <MiniBlock title="Returns">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {round.returns.map((r) => (
                          <li key={r.id}>• {r.title}</li>
                        ))}
                      </ul>
                    </MiniBlock>
                    <MiniBlock title="Timeline">
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(round.startsAt).toLocaleDateString()}
                        {round.endsAt
                          ? ` · Ends ${new Date(round.endsAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </MiniBlock>
                  </div>

                  {["OPEN", "BUILDING", "FUNDED"].includes(round.status) ? (
                    <AllocateButton
                      buildRoundId={round.id}
                      projectId={project.id}
                      projectName={project.name}
                      roundTitle={round.title}
                      tokenSymbol={project.tokenSymbol}
                      vibeBalance={portfolio.vibeBalance}
                    />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Activity + Proofs */}
        <div id="proofs" className="grid scroll-mt-24 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agent runs yet.</p>
              ) : (
                project.runs.map((r) => (
                  <Link
                    key={r.id}
                    href={`/projects/${project.slug}/agents`}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 hover:border-accent/40"
                  >
                    <div>
                      <div className="text-sm font-medium">{r.taskTitle}</div>
                      <p className="text-xs text-muted-foreground">
                        {r.agentName} · {r.model}
                      </p>
                    </div>
                    <Badge variant={r.status === "COMPLETED" ? "success" : "warning"}>
                      {r.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proofs of Build</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.proofs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No proofs yet.</p>
              ) : (
                project.proofs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proofs/${p.id}`}
                    className="block rounded-xl border border-border px-3 py-2.5 hover:border-accent/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{p.taskTitle}</span>
                      <Badge variant="success">{p.verificationStatus}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.filesChanged} files · {p.testsPassed}/{p.testsTotal} tests
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project assets */}
        <div className="grid gap-4 md:grid-cols-2">
          {project.tokenSymbol ? (
            <Card>
              <CardHeader>
                <CardTitle>Project Token</CardTitle>
                <Badge variant="vibe">${project.tokenSymbol}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {project.tokenName} represents economic exposure to {project.name}{" "}
                  under Build Round terms. Tokens are issued from normalized Build Units.
                </p>
              </CardContent>
            </Card>
          ) : null}
          {project.nfts.map((n) => (
            <Card key={n.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{n.imageEmoji}</span>
                  <div>
                    <CardTitle>{n.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{n.rarity}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{n.description}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {n.utility.map((u) => (
                    <li key={u}>• {u}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {project.history.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.history.map((h) => (
                <div key={h.title + h.date} className="flex gap-3 text-sm">
                  <div className="w-28 shrink-0 text-xs text-muted-foreground">
                    {new Date(h.date).toLocaleDateString()}
                  </div>
                  <div>
                    <div className="font-medium">{h.title}</div>
                    <div className="text-muted-foreground">{h.detail}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {project.updates.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.updates.map((u) => (
                <div key={u.id} className="rounded-xl border border-border p-3">
                  <div className="font-medium">{u.title}</div>
                  <div className="mt-1">
                    <Markdown content={u.body} />
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

function MiniBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}
