"use client";

import { cn } from "@/lib/utils";

export type GemmaState =
  | "idle"
  | "listening"
  | "analyzing"
  | "comparing"
  | "monitoring"
  | "reporting"
  | "founder"
  | "proof";

const stateLabel: Record<GemmaState, string> = {
  idle: "Ready",
  listening: "Listening",
  analyzing: "Analyzing",
  comparing: "Comparing",
  monitoring: "Monitoring",
  reporting: "Reporting",
  founder: "Founder assist",
  proof: "Proof analysis",
};

/**
 * Gemma visual identity: Gemini-inspired navy/blue intelligence accents,
 * custom orb with concentric context rings.
 */
export function GemmaOrb({
  size = 40,
  state = "idle",
  className,
  pulse = true,
}: {
  size?: number;
  state?: GemmaState;
  className?: string;
  pulse?: boolean;
}) {
  const ringClass =
    state === "analyzing" || state === "comparing"
      ? "origin-center animate-[gemma-ring_6s_linear_infinite]"
      : state === "idle" && pulse
        ? "animate-[gemma-idle_3.2s_ease-in-out_infinite]"
        : undefined;

  const coreGradient =
    state === "proof"
      ? { from: "#69a7ff", to: "#164f9c" }
      : state === "founder"
        ? { from: "#4f8cff", to: "#071b3d" }
        : { from: "#4f8cff", to: "#071b3d" };

  const uid = `g-${size}-${state}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      title={stateLabel[state]}
      aria-label={`Gemma · ${stateLabel[state]}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={cn(
          pulse && state !== "analyzing" ? "animate-gemma-breathe rounded-full" : undefined,
          ringClass
        )}
        aria-hidden
      >
        {/* Outer context ring */}
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke={`url(#${uid}-ring)`}
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="none"
        />
        {/* Segmented intelligence ring */}
        <circle
          cx="24"
          cy="24"
          r="17"
          stroke={`url(#${uid}-ring)`}
          strokeWidth="2"
          strokeDasharray={
            state === "comparing" ? "10 8 4 8" : state === "listening" ? "4 6" : "9 7"
          }
          fill="none"
          className={
            state === "analyzing" || state === "comparing"
              ? "origin-center animate-[gemma-ring_8s_linear_infinite]"
              : undefined
          }
          style={{ transformOrigin: "center" }}
        />
        {/* Core orb */}
        <circle cx="24" cy="24" r="11" fill={`url(#${uid}-core)`} />
        <circle cx="24" cy="24" r="4.5" fill="white" fillOpacity="0.88" />
        {state === "proof" ? (
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="#27d9e8"
            strokeWidth="1.5"
            strokeOpacity="0.55"
            fill="none"
          />
        ) : null}
        <defs>
          <linearGradient id={`${uid}-ring`} x1="4" y1="4" x2="44" y2="44">
            <stop stopColor="#071b3d" />
            <stop offset="0.55" stopColor="#164f9c" />
            <stop offset="1" stopColor="#69a7ff" />
          </linearGradient>
          <linearGradient id={`${uid}-core`} x1="12" y1="12" x2="36" y2="36">
            <stop stopColor={coreGradient.from} />
            <stop offset="1" stopColor={coreGradient.to} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export { stateLabel as gemmaStateLabel };
