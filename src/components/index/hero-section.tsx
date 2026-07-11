import { ArrowRight } from "lucide-react";

const STRIP = [
  { label: "YOU INVEST", value: "VIBE", tone: "text-[var(--vf-red)]" },
  {
    label: "THE PROJECT GETS",
    value: "AMD COMPUTE",
    tone: "text-[var(--vf-coral)]",
  },
  {
    label: "YOU RECEIVE",
    value: "PROJECT REWARDS",
    tone: "text-[var(--vf-magenta)]",
  },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 md:px-8">
      {/* Full-bleed abstract video background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/index/hero-bg-poster.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          className="absolute inset-0 hidden h-full w-full object-cover motion-safe:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/brand/index/hero-bg-poster.webp"
        >
          <source src="/brand/index/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,7,8,0.35)] via-[rgba(7,7,8,0.18)] to-[rgba(7,7,8,0.55)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,8,0.22)_0%,transparent_58%)]" />
        {/* Soft exit into the next section — no hard video cut */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[rgba(7,7,8,0.65)] to-[#070708] md:h-52" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-[2px]">
            AMD-powered builds
          </span>
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-[2px]">
            Gemma-guided discovery
          </span>
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-[2px]">
            Proof-backed rewards
          </span>
        </div>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.85rem] md:leading-[1.12] lg:text-[3.25rem]">
          Fund startup builds with{" "}
          <span className="vf-text-gradient-compute">AMD-powered</span>{" "}
          <span className="vf-text-gradient-brand">AI compute</span>.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
          Choose a project, invest VIBE, and watch agents turn GPU time into
          verified progress. When the work is proven, you receive project tokens
          and benefits.
        </p>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[var(--vf-shadow-md)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-0 sm:p-2">
            {STRIP.map((item, i) => (
              <div key={item.label} className="flex flex-1 items-center">
                {i > 0 ? (
                  <div
                    className="mx-1 hidden h-px w-4 shrink-0 bg-[var(--vf-cyan)]/70 sm:block sm:w-6"
                    aria-hidden
                  />
                ) : null}
                <div className="flex-1 rounded-xl px-3 py-3 text-center sm:py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                    {item.label}
                  </div>
                  <div
                    className={`mt-1 text-xs font-bold sm:text-sm ${item.tone}`}
                  >
                    {item.value}
                  </div>
                </div>
                {i < STRIP.length - 1 ? (
                  <div
                    className="mx-auto h-4 w-px bg-[var(--vf-cyan)]/50 sm:hidden"
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#how-it-works" className="vf-btn-primary">
            See how it works <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
