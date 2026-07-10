import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoSession } from "@/lib/demo/session";
import { requireJuror } from "@/lib/demo/require-juror";
import { getPortfolio } from "@/lib/queries/portfolio";
import { getProofById } from "@/lib/queries/proofs";
import { formatNumber, truncateHash } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { getGemmaGateway } from "@/lib/gemma";
import { GemmaProviderBadge } from "@/components/gemma/provider-badge";

export const dynamic = "force-dynamic";

export default async function ProofPage({
  params,
}: {
  params: Promise<{ proofId: string }>;
}) {
  const { proofId } = await params;
  const juror = await requireJuror(`/proofs/${proofId}`);
  const session = getDemoSession();
  const portfolio = getPortfolio(session.investorId);
  const proof = getProofById(proofId);
  if (!proof) notFound();
  const gemma = getGemmaGateway();
  const liveProof = await gemma.summarizeProof({ proofId });

  return (
    <AppShell
      role={juror.role}
      userName={juror.displayName}
      initials={juror.initials}
      title="Proof of Build"
      subtitle={proof.taskTitle}
      vibeBalance={portfolio.vibeBalance}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {proof.project ? (
              <Link
                href={`/projects/${proof.project.slug}`}
                className="text-sm text-accent hover:underline"
              >
                ← {proof.project.name}
              </Link>
            ) : null}
            {proof.run && proof.project ? (
              <Link
                href={`/projects/${proof.project.slug}/agents`}
                className="text-sm text-muted-foreground hover:underline"
              >
                Agent replay
              </Link>
            ) : null}
          </div>
          <Badge
            variant={
              proof.verificationStatus === "HUMAN_VERIFIED"
                ? "success"
                : proof.verificationStatus === "HASH_VERIFIED"
                  ? "accent"
                  : "outline"
            }
          >
            {proof.verificationStatus}
          </Badge>
        </div>

        {/* Executive seal */}
        <section className="card-surface card-glow relative overflow-hidden p-6 md:p-8">
          <div className="relative z-10 flex flex-wrap items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/30">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Proof of Build
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {proof.taskTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {proof.publicSummary}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SealStat label="Funded work" value={proof.taskTitle.slice(0, 28)} />
                <SealStat
                  label="Resources"
                  value={`${formatNumber((proof.inputTokens ?? 0) + (proof.outputTokens ?? 0))} tokens`}
                />
                <SealStat
                  label="Evidence"
                  value={`${proof.filesChanged} files · ${proof.testsPassed}/${proof.testsTotal} tests`}
                />
                <SealStat
                  label="Verified"
                  value={proof.verificationStatus.replaceAll("_", " ")}
                />
              </div>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-gemma">✦</span> Gemma for stakeholders
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{liveProof.title}</p>
            </div>
            <GemmaProviderBadge
              provider={liveProof.provider}
              attribution={
                liveProof.provider === "AMD_GEMMA"
                  ? "Gemma 4 · AMD Instinct"
                  : null
              }
            />
          </CardHeader>
          <CardContent>
            <Markdown content={liveProof.summary || proof.gemmaSummary || proof.publicSummary} />
            {liveProof.whatWasFunded || liveProof.whatWasProduced ? (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {liveProof.whatWasFunded ? (
                  <li>• Funded: {liveProof.whatWasFunded}</li>
                ) : null}
                {liveProof.whatWasProduced ? (
                  <li>• Produced: {liveProof.whatWasProduced}</li>
                ) : null}
                {liveProof.whatEvidenceExists ? (
                  <li>• Evidence: {liveProof.whatEvidenceExists}</li>
                ) : null}
                {liveProof.whatRemainsUnverified ? (
                  <li>• Unverified: {liveProof.whatRemainsUnverified}</li>
                ) : null}
              </ul>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Proof of Build evidences recorded execution — it does not guarantee
              production code quality. Human review remains important.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Agent & compute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Agent" value={proof.agentName} />
              <Row label="Harness" value={proof.harness} />
              <Row label="Model" value={proof.model} />
              <Row label="Provider" value={proof.provider} />
              <Row label="Compute" value={proof.computeSource} />
              <Row
                label="Time"
                value={`${formatNumber(proof.computeTimeSeconds ?? 0)}s`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Files" value={String(proof.filesChanged)} />
              <Row label="Lines +" value={String(proof.linesAdded)} />
              <Row label="Lines −" value={String(proof.linesRemoved)} />
              <Row
                label="Commit"
                value={proof.commitHash ? truncateHash(proof.commitHash, 8) : "—"}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Status" value={proof.verificationStatus} />
              <Row label="Manifest" value={truncateHash(proof.manifestHash, 8)} />
              <Row label="Artifact root" value={truncateHash(proof.artifactRootHash, 8)} />
              <Row
                label="Hash check"
                value={proof.hashCheck.matches ? "Matches" : "Mismatch"}
              />
            </CardContent>
          </Card>
        </div>

        <details className="card-surface group">
          <summary className="cursor-pointer list-none p-5 font-semibold">
            Artifacts
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Expand
            </span>
          </summary>
          <div className="space-y-2 border-t border-border px-5 pb-5">
            {proof.artifacts.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    {a.name}{" "}
                    <Badge variant="outline" className="ml-1">
                      {a.type}
                    </Badge>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    sha256:{truncateHash(a.hash, 10)}
                  </code>
                </div>
                {a.contentPreview ? (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-2 text-[11px] text-muted-foreground">
                    {a.contentPreview}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </details>

        <details className="card-surface">
          <summary className="cursor-pointer list-none p-5 font-semibold">
            Advanced · Canonical manifest
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Expand
            </span>
          </summary>
          <div className="border-t border-border p-5">
            <pre className="max-h-80 overflow-auto rounded-xl bg-black/50 p-4 text-[11px] leading-relaxed text-neutral-300">
              {proof.manifestJson}
            </pre>
          </div>
        </details>
      </div>
    </AppShell>
  );
}

function SealStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-black/25 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
