"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Bot, CheckCircle2, Cpu, Wallet } from "lucide-react";
import { SectionEyebrow } from "./section-shell";

const STEPS = [
  {
    n: "01",
    title: "Invest VIBE",
    body: "Pick a startup milestone and fund the next build.",
    label: "INVEST",
    short: "VIBE",
    icon: Wallet,
    color: "var(--vf-red)",
    soft: "rgba(255, 59, 71, 0.16)",
    glow: "rgba(255, 59, 71, 0.45)",
  },
  {
    n: "02",
    title: "AMD compute",
    body: "VIBE becomes AMD GPU capacity for project agents.",
    label: "COMPUTE",
    short: "AMD",
    icon: Cpu,
    color: "var(--vf-coral)",
    soft: "rgba(255, 90, 61, 0.16)",
    glow: "rgba(255, 90, 61, 0.45)",
  },
  {
    n: "03",
    title: "Agents build",
    body: "Agents research, ship, test, and move the product.",
    label: "EXECUTION",
    short: "Agents",
    icon: Bot,
    color: "var(--vf-violet)",
    soft: "rgba(130, 104, 255, 0.16)",
    glow: "rgba(130, 104, 255, 0.45)",
  },
  {
    n: "04",
    title: "Proof & rewards",
    body: "Verified work unlocks tokens and benefits.",
    label: "VALUE",
    short: "Rewards",
    icon: CheckCircle2,
    color: "var(--vf-magenta)",
    soft: "rgba(232, 60, 255, 0.16)",
    glow: "rgba(232, 60, 255, 0.45)",
  },
] as const;

/**
 * Full-viewport sticky stage. Progress is cumulative during the visit:
 * scrolling up never turns off a step that has already been activated.
 */
export function ProductFlow() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isComplete, setIsComplete] = useState(false);
  const [isRetired, setIsRetired] = useState(false);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  const progress = useMotionValue(reduceMotion ? 1 : 0);
  const maxSeen = useRef(reduceMotion ? 1 : 0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value <= maxSeen.current) return;
    maxSeen.current = value;
    progress.set(value);
    if (value >= 0.99) setIsComplete(true);
  });

  useEffect(() => {
    if (!reduceMotion) return;
    maxSeen.current = 1;
    progress.set(1);
    setIsComplete(true);
  }, [progress, reduceMotion]);

  useEffect(() => {
    if (!isComplete || isRetired) return;
    const runway = runwayRef.current;
    if (!runway) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Collapse the consumed runway only after it has left above the viewport.
      // Scroll anchoring can then preserve the section currently being viewed.
      if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
        setIsRetired(true);
        observer.disconnect();
      }
    });
    observer.observe(runway);
    return () => observer.disconnect();
  }, [isComplete, isRetired]);

  // Line fills in step with the nodes (visible between balls as you go)
  const pathProgress = useTransform(progress, [0.04, 0.88], [0, 1]);
  const finale = useTransform(progress, [0.78, 0.94], [0, 1]);
  const recapOpacity = useTransform(progress, [0.93, 0.985], [0, 1]);

  // Each connector lights when the path reaches that span (0→1, 1→2, 2→3)
  const link01 = useTransform(pathProgress, [0.0, 0.28], [0, 1]);
  const link12 = useTransform(pathProgress, [0.28, 0.58], [0, 1]);
  const link23 = useTransform(pathProgress, [0.58, 0.9], [0, 1]);

  // Ambient glow behind each step node — fades in as step activates
  const glow0 = useTransform(progress, [0.06, 0.16], [0, 1]);
  const glow1 = useTransform(progress, [0.24, 0.34], [0, 1]);
  const glow2 = useTransform(progress, [0.42, 0.52], [0, 1]);
  const glow3 = useTransform(progress, [0.60, 0.70], [0, 1]);
  const glows = [glow0, glow1, glow2, glow3];

  return (
    <section id="how-it-works" className="relative scroll-mt-0">
      <div
        ref={runwayRef}
        className={isRetired ? "relative h-dvh" : "relative h-[190vh] md:h-[200vh]"}
      >
        <div
          className={`${isRetired ? "relative" : "sticky top-0"} flex h-dvh flex-col overflow-hidden bg-[#070708]`}
        >
          {/* Ambient lights that track each step's activation */}
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            aria-hidden
          >
            {[
              "rgba(255,59,71,0.2)",
              "rgba(255,90,61,0.2)",
              "rgba(130,104,255,0.2)",
              "rgba(232,60,255,0.2)",
            ].map((c, i) => (
              <motion.div
                key={i}
                className="absolute top-[38%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${12.5 + i * 25}%`,
                  width: 320,
                  height: 320,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${c}, transparent 70%)`,
                  opacity: glows[i],
                  filter: "blur(60px)",
                }}
              />
            ))}

            {/* Traveling beam that sweeps along the connector */}
            <motion.div
              className="absolute top-[38%] h-36 -translate-y-1/2"
              style={{
                left: "12.5%",
                width: "75%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,90,61,0.07), rgba(232,60,255,0.05), transparent)",
                opacity: useTransform(pathProgress, [0, 0.15, 0.85, 1], [0, 0.6, 0.6, 0]),
                filter: "blur(50px)",
                x: useTransform(pathProgress, [0, 1], ["-100%", "100%"]),
              }}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-center px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto w-full max-w-[var(--vf-index-max-width)] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]">
              <SectionEyebrow className="text-center text-white/70 text-sm md:text-base">
                How it works
              </SectionEyebrow>
              <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
                From VIBE to verified progress.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-center text-sm text-white/70 md:text-base">
                Invest → compute → agents → proof.
              </p>

              {/* Desktop horizontal path */}
              <div className="relative mx-auto mt-10 hidden max-w-6xl md:mt-14 md:block">
                {/*
                  Connectors sit BETWEEN node centers only.
                  Ghost track always visible; brand fill grows with scroll.
                  Nodes (z-20, opaque) cover the line under the balls.
                */}
                <div
                  className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 z-0 h-[3px] -translate-y-1/2 md:top-7"
                  aria-hidden
                >
                  {/* Always-on ghost rail so the path is readable early */}
                  <div className="absolute inset-0 rounded-full bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]" />

                  {/* Three lit segments — stronger glow, thicker fill */}
                  <div className="absolute inset-0 flex">
                    <ConnectorFill progress={link01} className="flex-1" />
                    <ConnectorFill progress={link12} className="flex-1" />
                    <ConnectorFill progress={link23} className="flex-1" />
                  </div>
                </div>

                <ol className="relative z-10 grid grid-cols-4 gap-4 lg:gap-6">
                  {STEPS.map((s, i) => (
                    <HorizontalStep
                      key={s.n}
                      step={s}
                      index={i}
                      isLast={i === STEPS.length - 1}
                      progress={progress}
                      finale={finale}
                      reduceMotion={!!reduceMotion}
                    />
                  ))}
                </ol>
              </div>

              {/* Mobile: 2×2 cards, short top connectors for row 1 */}
              <div className="relative mx-auto mt-10 max-w-md md:hidden">
                <div
                  className="pointer-events-none absolute left-[25%] right-[25%] top-6 z-0 h-[3px] -translate-y-1/2"
                  aria-hidden
                >
                  <div className="absolute inset-0 rounded-full bg-white/20" />
                  <ConnectorFill progress={link01} className="absolute inset-0" />
                </div>
                <div
                  className="pointer-events-none absolute left-[25%] right-[25%] top-[calc(50%+0.35rem)] z-0 h-[3px] -translate-y-1/2"
                  aria-hidden
                >
                  <div className="absolute inset-0 rounded-full bg-white/20" />
                  <ConnectorFill progress={link23} className="absolute inset-0" />
                </div>
                <ol className="relative z-10 grid grid-cols-2 gap-3">
                  {STEPS.map((s, i) => (
                    <HorizontalStep
                      key={s.n}
                      step={s}
                      index={i}
                      isLast={i === STEPS.length - 1}
                      progress={progress}
                      finale={finale}
                      reduceMotion={!!reduceMotion}
                      compact
                    />
                  ))}
                </ol>
              </div>

              {/* Recap — solid once complete */}
              <motion.div
                style={{ opacity: recapOpacity }}
                className="mx-auto mt-10 max-w-xl md:mt-12"
              >
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/15 bg-black/55 px-4 py-2.5 text-xs font-semibold backdrop-blur-sm sm:text-sm">
                  {STEPS.map((s, i) => (
                    <span key={s.n} className="inline-flex items-center gap-2">
                      <span style={{ color: s.color }}>{s.short}</span>
                      {i < STEPS.length - 1 ? (
                        <span className="text-[var(--vf-coral)]/70" aria-hidden>
                          →
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConnectorFill({
  progress,
  className = "",
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="h-full w-full origin-left rounded-full"
        style={{
          scaleX: progress,
          background: "var(--vf-gradient-brand)",
          boxShadow:
            "0 0 10px rgba(255, 59, 71, 0.65), 0 0 22px rgba(232, 60, 255, 0.35)",
        }}
      />
    </div>
  );
}

function HorizontalStep({
  step,
  index,
  isLast,
  progress,
  finale,
  reduceMotion,
  compact = false,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isLast: boolean;
  progress: MotionValue<number>;
  finale: MotionValue<number>;
  reduceMotion: boolean;
  compact?: boolean;
}) {
  const Icon = step.icon;
  const start = 0.06 + (index / STEPS.length) * 0.72;
  const mid = start + 0.1;

  const opacity = useTransform(progress, [start, mid], [0.22, 1]);
  const y = useTransform(
    progress,
    [start, mid],
    reduceMotion ? [0, 0] : [16, 0]
  );
  const nodeScale = useTransform(
    progress,
    [start, mid],
    reduceMotion ? [1, 1] : [0.78, 1]
  );
  const boxShadow = useTransform(progress, (v) => {
    if (reduceMotion) {
      return `0 0 0 4px ${step.soft}, 0 0 22px ${step.glow}`;
    }
    const t = Math.min(1, Math.max(0, (v - start) / (mid - start || 1)));
    if (t < 0.12) return "none";
    return `0 0 0 4px ${step.soft}, 0 0 ${10 + t * 20}px ${step.glow}`;
  });

  const ringScale = useTransform(
    finale,
    [0, 1],
    reduceMotion ? [1, 1] : [0.5, 1.65]
  );
  const ringOpacity = useTransform(
    finale,
    [0, 0.35, 1],
    reduceMotion ? [0, 0, 0] : [0, 0.9, 0.65]
  );
  const cardGlow = useTransform(finale, (t) => {
    const a = reduceMotion ? 1 : t;
    return `0 10px 36px rgba(232, 60, 255, ${0.05 + a * 0.2}), 0 0 ${8 + a * 22}px ${step.glow}, 0 0 0 1px rgba(255, 255, 255, ${0.12 + a * 0.18})`;
  });

  return (
    <motion.li
      style={{ opacity, y }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative z-20 mb-5">
        {isLast ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--vf-magenta)] md:h-16 md:w-16"
            style={{
              scale: ringScale,
              opacity: ringOpacity,
              boxShadow:
                "0 0 22px rgba(232, 60, 255, 0.45), 0 0 36px rgba(130, 104, 255, 0.3)",
            }}
          />
        ) : null}
        <motion.div
          style={{ scale: nodeScale, boxShadow }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full md:h-16 md:w-16"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={
              isLast
                ? {
                    background:
                      "linear-gradient(#0c0a0e, #0c0a0e) padding-box, linear-gradient(135deg, #ff3b47, #e83cff) border-box",
                    border: "2px solid transparent",
                  }
                : {
                    background: "#0c0a0e",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }
            }
          />
          <div
            className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-full md:h-11 md:w-11"
            style={{
              background: isLast
                ? "linear-gradient(135deg, rgba(255,59,71,0.28), rgba(232,60,255,0.24))"
                : step.soft,
              color: step.color,
            }}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className={`relative z-10 w-full rounded-2xl p-4 text-left md:p-5 ${
          compact ? "min-h-[8rem]" : ""
        }`}
        style={{
          background: isLast
            ? "linear-gradient(#121014, #121014) padding-box, linear-gradient(135deg, rgba(255,59,71,0.75), rgba(232,60,255,0.55)) border-box"
            : "rgba(18,16,20,0.95)",
          border: isLast
            ? "1px solid transparent"
            : `1px solid color-mix(in oklab, ${step.color} 30%, transparent)`,
          boxShadow: cardGlow,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-[0.14em] md:text-sm"
            style={{ color: step.color }}
          >
            {step.label}
          </span>
          {isLast ? (
            <motion.span
              style={{ opacity: finale }}
              className="rounded-full bg-[rgba(232,60,255,0.14)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--vf-magenta)]"
            >
              Unlocked
            </motion.span>
          ) : null}
        </div>
        <h3 className="mt-1.5 font-display text-base font-semibold md:text-lg">
          <span className="mr-1.5 font-mono text-sm text-muted-foreground">
            {step.n}
          </span>
          {step.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {step.body}
        </p>
      </motion.div>
    </motion.li>
  );
}
