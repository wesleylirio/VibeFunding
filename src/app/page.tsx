import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users, Waves } from "lucide-react";
import { VibeMark, VibeWordmark } from "@/components/brand/logo";
import { ThemeSelector } from "@/lib/brand/theme";
import { getProjectBySlug } from "@/lib/queries/projects";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const featured = getProjectBySlug("collabmesh");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <VibeWordmark />
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <Link
            href="/login"
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign in
          </Link>
          <Link
            href="/login?role=INVESTOR"
            className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white shadow-[0_0_20px_var(--accent-glow)]"
          >
            Explore as Investor
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 pb-20 pt-8 md:px-6">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <VibeMark size={16} />
              Investment layer of the agentic economy
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Invest in the builders of the agentic economy.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Allocate capital, AI credits and compute to real projects. Track
              agents at work. Receive exposure to the value created — verified
              through Proof of Build.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login?role=INVESTOR"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-[0_0_28px_var(--accent-glow)]"
              >
                Explore as Investor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?role=FOUNDER"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-5 text-sm font-semibold"
              >
                Launch as Founder
              </Link>
            </div>
          </div>

          <div className="card-surface card-glow relative p-6">
            <div className="relative z-10 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Capital → Value
              </div>
              <FlowDiagram />
            </div>
          </div>
        </section>

        {/* Participants */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">Participants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Productive capacity from every scale of participation.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ParticipantCard
              title="Sardinhas"
              body="Smaller participants convert idle AI credits, agent hours or modest capital into project exposure."
              icon={<Waves className="h-5 w-5 text-vibe" />}
            />
            <ParticipantCard
              title="Computers People"
              body="Operators supply AMD GPUs and infrastructure, choosing liquid payment or Project Token exposure."
              icon={<Users className="h-5 w-5 text-accent" />}
            />
            <ParticipantCard
              title="Tubarões"
              body="Larger allocators build portfolios across Build Rounds with diligence, proofs and concentration tools."
              icon={<Sparkles className="h-5 w-5 text-gemma" />}
            />
          </div>
        </section>

        {/* Gemma + Proof */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 text-gemma">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gemma-soft">
                <GemmaOrb size={22} />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Gemma</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Portfolio intelligence companion for discovery, diligence, progress
              analysis and founder communication — never auto-investing.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Portfolio briefing & concentration</li>
              <li>• Project due diligence</li>
              <li>• Proof of Build explanations</li>
              <li>• Founder drafts under human control</li>
            </ul>
          </div>
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 text-success">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--success-soft)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Proof of Build
              </h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The platform primitive that connects resources to evidence.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {[
                "What was funded",
                "What agents did",
                "What evidence exists",
                "What you can verify",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-muted-foreground"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured ? (
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Featured project
            </h2>
            <div
              className="card-surface mt-4 overflow-hidden"
              style={{
                background: `linear-gradient(120deg, ${featured.accentColor}33, transparent 50%), var(--card)`,
              }}
            >
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white"
                    style={{ background: featured.accentColor }}
                  >
                    {featured.logoEmoji}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">{featured.name}</h3>
                      {featured.tokenSymbol ? (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                          ${featured.tokenSymbol}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                      {featured.shortDescription}
                    </p>
                    {featured.rounds[0] ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Build Round · {featured.rounds[0].title} ·{" "}
                        {formatCompact(featured.rounds[0].fundedValue)}/
                        {formatCompact(featured.rounds[0].targetValue)} BU ·{" "}
                        {featured.proofs.length} proof
                        {featured.proofs.length === 1 ? "" : "s"} · community
                        active
                      </p>
                    ) : null}
                  </div>
                </div>
                <Link
                  href="/login?role=INVESTOR&next=/projects/collabmesh"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 dark:bg-white"
                >
                  Allocate as Investor
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="card-surface flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold">Enter VibeFunding</h2>
            <p className="text-sm text-muted-foreground">
              Investor is the default path. Founders can switch anytime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?role=INVESTOR"
              className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-white"
            >
              Explore as Investor
            </Link>
            <Link
              href="/login?role=FOUNDER"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
            >
              Launch as Founder
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FlowDiagram() {
  const steps = [
    { t: "Invest resources", c: "var(--vf-flow)" },
    { t: "Agents build", c: "var(--vf-agent)" },
    { t: "Proof of Build", c: "var(--vf-proof)" },
    { t: "Projects grow", c: "var(--vf-compute)" },
    { t: "Capture value", c: "var(--vf-value)" },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.t} className="flex items-center gap-3">
          <div
            className="brand-node flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: s.c }}
          >
            {i + 1}
          </div>
          <div className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
            {s.t}
          </div>
        </div>
      ))}
      <div className="brand-flow-line h-1 rounded-full opacity-80" />
    </div>
  );
}

function ParticipantCard({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function GemmaOrb({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="12" stroke="url(#go)" strokeWidth="2" />
      <circle cx="16" cy="16" r="5" fill="url(#go2)" />
      <defs>
        <linearGradient id="go" x1="4" y1="4" x2="28" y2="28">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="go2" x1="11" y1="11" x2="21" y2="21">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#5b8cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
