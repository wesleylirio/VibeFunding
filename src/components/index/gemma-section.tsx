import { Sparkles } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SectionEyebrow, SectionShell } from "./section-shell";

const CAPS = [
  "Discover projects that match your interests",
  "Understand strengths, risks, and open questions",
  "Follow what changed after you invested",
  "Turn Proof of Build into a clear investor summary",
];

export function GemmaSection() {
  return (
    <SectionShell id="gemma" wash="gemma">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal y={40} className="relative">
          <GemmaBlink />
        </Reveal>

        <div>
          <Reveal delay={0.05}>
            <SectionEyebrow>Your AI investment guide</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
              Meet Gemma
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Gemma learns what you care about, recommends relevant projects,
              explains risks, and translates technical progress into plain
              language.
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">
              She helps you understand the opportunity. She never invests for
              you.
            </p>
          </Reveal>
          <RevealGroup className="mt-6 grid gap-2 sm:grid-cols-2" stagger={0.07}>
            {CAPS.map((c) => (
              <RevealItem key={c}>
                <div className="flex items-start gap-2 rounded-xl border border-[rgba(79,140,255,0.24)] bg-[rgba(7,27,61,0.3)] px-3 py-2.5 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gemma" />
                  {c}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </SectionShell>
  );
}

function GemmaBlink() {
  return (
    <div
      className="gemma-blink-stage mx-auto aspect-square w-full max-w-md"
      role="img"
      aria-label="Gemma intelligence eye blinking"
    >
      <div className="gemma-blink-halo" />
      <div className="gemma-blink-orbit gemma-blink-orbit-outer">
        <i />
        <i />
        <i />
      </div>
      <div className="gemma-blink-orbit gemma-blink-orbit-inner">
        <i />
        <i />
      </div>
      <div className="gemma-blink-eye">
        <div className="gemma-blink-iris">
          <div className="gemma-blink-pupil" />
          <div className="gemma-blink-glint" />
        </div>
      </div>
      <div className="gemma-blink-scan" />
    </div>
  );
}
