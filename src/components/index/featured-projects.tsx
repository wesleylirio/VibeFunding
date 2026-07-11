import { SectionEyebrow, SectionShell } from "./section-shell";

export type IndexProject = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  logoEmoji: string;
  accentColor: string;
  proofCount: number;
  activeRound: { progress: number; title?: string | null } | null;
  detailed?: boolean | null;
};

/** Showcase only — no login CTAs (those live on the final CTA). */
export function FeaturedProjects({ projects }: { projects: IndexProject[] }) {
  const [featured, ...rest] = projects;
  const supporting = rest.slice(0, 2);

  if (!featured) return null;

  return (
    <SectionShell id="projects" wash="projects">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Choose what gets built</SectionEyebrow>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
          Real startups. Clear milestones.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Each project shows the next build, progress, and verified Proofs —
          so you know what your VIBE supports.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-12">
        <article className="vf-card-featured flex flex-col p-6 lg:col-span-7 lg:p-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white shadow-lg"
              style={{ background: featured.accentColor }}
            >
              {featured.logoEmoji}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--vf-coral)]">
                Featured build
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold md:text-2xl">
                {featured.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {featured.shortDescription}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Build progress"
              value={`${featured.activeRound?.progress ?? 0}%`}
            />
            <Metric label="Proofs" value={String(featured.proofCount)} />
            <Metric
              label="Next milestone"
              value={featured.activeRound?.title || "Open round"}
              small
            />
          </div>

          {featured.activeRound ? (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${featured.activeRound.progress}%`,
                  background: "var(--vf-gradient-compute)",
                }}
              />
            </div>
          ) : null}
        </article>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {supporting.map((p) => (
            <article key={p.id} className="card-surface flex flex-1 flex-col p-5">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-white"
                  style={{ background: p.accentColor }}
                >
                  {p.logoEmoji}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.shortDescription}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {p.proofCount} proof{p.proofCount === 1 ? "" : "s"} ·{" "}
                    {p.activeRound?.progress ?? 0}% funded
                  </p>
                </div>
              </div>
            </article>
          ))}

          <div className="rounded-2xl border border-[rgba(232,60,255,0.28)] bg-[rgba(232,60,255,0.06)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--vf-magenta)]">
              Gemma recommends
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              After onboarding, Gemma ranks projects against your interests,
              risk posture, and thesis—before you deploy VIBE.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Metric({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          small
            ? "mt-1 truncate text-xs font-semibold text-foreground"
            : "mt-1 font-display text-lg font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </div>
    </div>
  );
}
