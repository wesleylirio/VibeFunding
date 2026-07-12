import Link from "next/link";
import { Bot, Coins, FileCheck2, Radio, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

type TimelineEvent = {
  id: string;
  type: "allocation" | "run" | "proof" | "update";
  title: string;
  detail: string;
  date: string;
  href?: string;
};

export default async function ActivityPage() {
  const juror = await requireJuror("/activity");
  const session = await getDemoSession();
  const portfolio = await getPortfolio(session.investorId);

  const events: TimelineEvent[] = [
    ...portfolio.allocations.map((allocation) => ({
      id: allocation.id,
      type: "allocation" as const,
      title: `${formatNumber(allocation.amount)} VIBE allocated`,
      detail: `${allocation.project?.name ?? "Build Round"} · ${allocation.settlementStatus.toLowerCase().replaceAll("_", " ")}`,
      date: allocation.createdAt,
      href: allocation.project?.slug ? `/projects/${allocation.project.slug}` : undefined,
    })),
    ...portfolio.recentRuns.map((run) => ({
      id: run.id,
      type: "run" as const,
      title: run.taskTitle,
      detail: `${run.project?.name ?? "Project"} · agent run ${run.status.toLowerCase()}`,
      date: run.createdAt,
      href: run.project?.slug ? `/projects/${run.project.slug}/agents` : undefined,
    })),
    ...portfolio.recentProofs.map((proof) => ({
      id: proof.id,
      type: "proof" as const,
      title: "Proof of Build sealed",
      detail: `${proof.taskTitle} · ${proof.testsPassed}/${proof.testsTotal} tests`,
      date: proof.createdAt,
      href: `/proofs/${proof.id}`,
    })),
    ...portfolio.updates.map((update) => ({
      id: update.id,
      type: "update" as const,
      title: update.title,
      detail: `${update.project?.name ?? "Project"} · stakeholder update`,
      date: update.publishedAt || update.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Activity"
      subtitle="Your live funding-to-build trail"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card-surface card-glow overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gemma">
                <Radio className="h-4 w-4" /> Live build ledger
              </div>
              <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                From allocation to evidence
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Every event connects investor capital, AMD compute, agent execution,
                and the Proofs that make progress inspectable.
              </p>
            </div>
            <Badge variant="gemma">{events.length} recorded events</Badge>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Allocations" value={portfolio.allocations.length} />
            <Stat label="Agent runs" value={portfolio.recentRuns.length} />
            <Stat label="Proofs" value={portfolio.recentProofs.length} />
            <Stat label="Updates" value={portfolio.updates.length} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <CardTitle>Execution timeline</CardTitle>
              <Badge variant="outline">Newest first</Badge>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-1 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-border">
                {events.map((event) => (
                  <TimelineRow key={`${event.type}-${event.id}`} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>How to read it</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <Legend icon={<Coins className="h-4 w-4" />} label="VIBE funds a Build Round" />
                <Legend icon={<Bot className="h-4 w-4" />} label="Agents execute the milestone" />
                <Legend icon={<FileCheck2 className="h-4 w-4" />} label="Proof seals the evidence" />
                <Legend icon={<Sparkles className="h-4 w-4" />} label="Gemma explains what changed" />
              </CardContent>
            </Card>
            <Link href="/gemma" className="block rounded-2xl border border-gemma/30 bg-gemma/5 p-5 hover:bg-gemma/10">
              <div className="text-xs font-semibold uppercase tracking-wide text-gemma">Ask Gemma</div>
              <div className="mt-2 font-medium">What changed in my portfolio?</div>
              <p className="mt-1 text-sm text-muted-foreground">Turn this event trail into a decision-ready briefing.</p>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const icon = event.type === "allocation" ? <Coins className="h-4 w-4" />
    : event.type === "run" ? <Bot className="h-4 w-4" />
      : event.type === "proof" ? <FileCheck2 className="h-4 w-4" />
        : <Sparkles className="h-4 w-4" />;
  const content = (
    <div className="group relative flex gap-4 rounded-xl p-3 hover:bg-muted/40">
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-gemma">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium group-hover:text-gemma">{event.title}</div>
          <time className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</time>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
      </div>
    </div>
  );
  return event.href ? <Link href={event.href}>{content}</Link> : content;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-border bg-muted/30 p-3"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}

function Legend({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-3"><span className="text-gemma">{icon}</span><span>{label}</span></div>;
}
