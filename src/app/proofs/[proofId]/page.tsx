import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { PostInvestProofFlow } from "@/components/proof/post-invest-proof-flow";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getProofById } from "@/lib/queries/proofs";
import { getRunWithEvents } from "@/lib/queries/agents";
import { formatNumber, truncateHash } from "@/lib/utils";
import { getDb } from "@/lib/db";
import { allocations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ProofPage({
  params,
}: {
  params: Promise<{ proofId: string }>;
}) {
  const { proofId } = await params;
  const juror = await requireJuror(`/proofs/${proofId}`);
  const session = await getDemoSession();
  const portfolio = await getPortfolio(session.investorId);
  const proof = getProofById(proofId);
  if (!proof) notFound();

  const runBundle =
    proof.run?.id != null
      ? getRunWithEvents(proof.run.id, juror.role)
      : null;

  const projectSlug = proof.project?.slug;
  const communityHref = projectSlug
    ? `/projects/${projectSlug}/community`
    : "/discover";

  let supporters = 12;
  try {
    const db = getDb();
    const rows = db
      .select()
      .from(allocations)
      .where(eq(allocations.projectId, proof.projectId))
      .all();
    const unique = new Set(rows.map((r) => r.investorId));
    supporters = Math.max(unique.size, 3);
  } catch {
    /* keep default */
  }

  const technicalEvidence = (
    <div className="space-y-2 text-sm">
      <Row label="Agent" value={proof.agentName} />
      <Row label="Model" value={proof.model || "—"} />
      <Row
        label="Commit"
        value={proof.commitHash ? truncateHash(proof.commitHash, 8) : "—"}
      />
      <Row
        label="Tests"
        value={`${proof.testsPassed}/${proof.testsTotal}`}
      />
      <Row
        label="Tokens"
        value={formatNumber(
          (proof.inputTokens ?? 0) + (proof.outputTokens ?? 0)
        )}
      />
      <Row label="Manifest" value={truncateHash(proof.manifestHash, 8)} />
      {proof.artifacts.map((a) => (
        <div
          key={a.id}
          className="rounded-lg border border-border px-3 py-2 text-xs"
        >
          {a.name} · {a.type}
        </div>
      ))}
    </div>
  );

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Proof of Build"
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Proof of Build
              {proof.project ? ` · ${proof.project.name}` : ""}
            </div>
            <h1 className="font-display text-lg font-semibold tracking-tight md:text-xl">
              {proof.taskTitle}
            </h1>
          </div>
          <Badge
            variant={
              proof.verificationStatus === "HUMAN_VERIFIED" ||
              proof.verificationStatus === "HASH_VERIFIED"
                ? "success"
                : "outline"
            }
          >
            {proof.verificationStatus}
          </Badge>
        </section>

        <PostInvestProofFlow
          run={runBundle?.run ?? null}
          events={runBundle?.events ?? []}
          role={juror.role === "FOUNDER" ? "FOUNDER" : "INVESTOR"}
          projectName={proof.project?.name}
          projectSlug={projectSlug}
          accentColor={proof.project?.accentColor || "#20d9c2"}
          roundTitle={proof.round?.title}
          communityHref={communityHref}
          tokenSymbol={proof.project?.tokenSymbol}
          defaultSupporters={supporters}
          technicalEvidence={technicalEvidence}
        />
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
