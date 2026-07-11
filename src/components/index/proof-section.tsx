import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SectionEyebrow, SectionShell } from "./section-shell";

const QUESTIONS = [
  "Funded scope locked",
  "Agent work attributed",
  "Compute reconciled",
  "Tests and commits linked",
  "Artifacts cryptographically signed",
];

export function ProofSection() {
  return (
    <SectionShell id="proof" wash="proof">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Reveal>
            <SectionEyebrow>Verifiable progress</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
              Every claim leaves a trail.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Proof of Build turns execution into an inspectable record—from
              funded scope and compute usage to tests, commits, and shipped
              artifacts.
            </p>
          </Reveal>
          <RevealGroup className="mt-6 space-y-2" stagger={0.06}>
            {QUESTIONS.map((item) => (
              <RevealItem key={item}>
                <div className="flex items-center gap-2 rounded-xl border border-[rgba(130,104,255,0.28)] bg-[rgba(130,104,255,0.06)] px-4 py-3 text-sm text-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--vf-violet)]" />
                  {item}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.15}>
            <p className="mt-5 text-sm font-medium text-foreground">
              A milestone is not complete because someone says it is. It is
              complete when the evidence agrees.
            </p>
          </Reveal>
        </div>

        <Reveal y={40} delay={0.08} className="space-y-4">
          <ProofBuildAnimation />
          <div className="proof-live-card rounded-2xl border border-[rgba(130,104,255,0.4)] bg-[rgba(18,16,20,0.94)] p-5 font-mono text-xs shadow-[var(--vf-shadow-md)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[var(--vf-violet)]">build.receipt / BR-003</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(130,104,255,0.14)] px-2 py-0.5 text-[10px] font-medium text-[var(--vf-violet)]">
                <CheckCircle2 className="h-3 w-3" />
                Chain verified
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-muted-foreground">
              <div className="flex justify-between gap-4">
                <dt>Milestone</dt>
                <dd className="text-foreground">Collab graph API</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Execution</dt>
                <dd className="text-foreground">14 files · 6 commits</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Tests passed</dt>
                <dd className="text-[var(--vf-magenta)]">28 / 28</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Compute used</dt>
                <dd className="text-[var(--vf-coral)]">3.2 GPU-h</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Artifact hash</dt>
                <dd className="truncate text-foreground">0x7f3a…c91e</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border pt-3 font-sans text-[11px] leading-relaxed text-muted-foreground">
              Gemma verified that execution, compute, and test evidence match
              the funded Build Round scope.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function ProofBuildAnimation() {
  const nodes = [
    ["01", "Scope", "locked"],
    ["02", "Agents", "shipped"],
    ["03", "Tests", "28 / 28"],
    ["04", "Artifact", "signed"],
  ] as const;

  return (
    <div
      className="proof-build-stage aspect-[16/10]"
      role="img"
      aria-label="Animated Proof of Build verification pipeline"
    >
      <div className="proof-build-grid" />
      <div className="proof-build-beam" />
      <div className="proof-build-nodes">
        {nodes.map(([number, label, status], index) => (
          <div
            key={number}
            className="proof-build-node"
            style={{ "--proof-delay": `${index * 0.72}s` } as React.CSSProperties}
          >
            <span>{number}</span>
            <strong>{label}</strong>
            <small>{status}</small>
          </div>
        ))}
      </div>
      <div className="proof-build-core">
        <div className="proof-build-ring" />
        <ShieldCheck aria-hidden />
        <span>VERIFIED</span>
      </div>
      <div className="proof-build-hash">0x7f3a · c91e</div>
    </div>
  );
}
