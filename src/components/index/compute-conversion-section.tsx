import { ArtworkPlaceholder } from "./artwork-placeholder";
import { SectionEyebrow, SectionShell } from "./section-shell";

const METRICS = [
  { label: "Conversion", value: "50 VIBE", sub: "→ 1 GPU hour" },
  { label: "Destination", value: "AMD GPU", sub: "agent capacity" },
  { label: "Outcome", value: "Build power", sub: "not idle capital" },
];

export function ComputeConversionSection() {
  return (
    <SectionShell id="compute">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <ArtworkPlaceholder
            assetName="vibe-to-compute.webp"
            src="/brand/index/vibe-to-compute.webp"
            alt="VIBE energy converting into AMD GPU compute capacity"
            aspectRatio="4/3"
            colorMode="compute"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SectionEyebrow>VIBE → AMD compute</SectionEyebrow>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
            Your investment becomes{" "}
            <span className="vf-text-gradient-compute">productive GPU time</span>
            .
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            VIBE is not a vague pledge. It is converted into AMD GPU capacity
            that project agents use to research, design, code, test, and ship
            the next milestone.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-[rgba(255,90,61,0.28)] bg-[rgba(255,90,61,0.06)] px-3 py-3"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--vf-coral)]">
                  {m.label}
                </div>
                <div className="mt-1 font-display text-sm font-semibold">
                  {m.value}
                </div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
