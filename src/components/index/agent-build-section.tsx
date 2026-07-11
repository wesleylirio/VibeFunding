import { ArtworkPlaceholder } from "./artwork-placeholder";
import { SectionEyebrow, SectionShell } from "./section-shell";

const MODULES = [
  "Research",
  "Design",
  "Code",
  "Test",
  "Deploy",
];

export function AgentBuildSection() {
  return (
    <SectionShell id="agents">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionEyebrow>Agents build</SectionEyebrow>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
            Watch the product get constructed in layers.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Agents use funded AMD compute to complete concrete tasks. Follow
            Build Round progress, deliverables, tests, and project updates as
            the work happens.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {MODULES.map((m, i) => (
              <li
                key={m}
                className="rounded-full border border-[rgba(130,104,255,0.35)] bg-[rgba(130,104,255,0.1)] px-3 py-1.5 text-xs font-medium text-[var(--vf-violet)]"
              >
                <span className="mr-1.5 font-mono text-[10px] opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {m}
              </li>
            ))}
          </ul>
        </div>
        <ArtworkPlaceholder
          assetName="agents-building.webp"
          src="/brand/index/agents-building.webp"
          alt="Violet agent nodes executing research, design, code, test, and deploy modules"
          aspectRatio="4/3"
          colorMode="gemma"
        />
      </div>
    </SectionShell>
  );
}
