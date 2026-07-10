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
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      title={stateLabel[state]}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={pulse ? "animate-gemma-breathe rounded-full" : undefined}
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#gemma-ring)"
          strokeWidth="2"
          strokeDasharray="8 6"
          className={state !== "idle" ? "origin-center animate-[gemma-ring_8s_linear_infinite]" : undefined}
          style={{ transformOrigin: "center" }}
        />
        <circle cx="24" cy="24" r="12" fill="url(#gemma-core)" />
        <circle cx="24" cy="24" r="4" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="gemma-ring" x1="4" y1="4" x2="44" y2="44">
            <stop stopColor="#22d3ee" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#5b8cff" />
          </linearGradient>
          <linearGradient id="gemma-core" x1="12" y1="12" x2="36" y2="36">
            <stop stopColor="#7c5cfc" />
            <stop offset="1" stopColor="#3b6ef5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export { stateLabel as gemmaStateLabel };
