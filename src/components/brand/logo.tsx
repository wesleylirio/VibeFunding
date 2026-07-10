import { cn } from "@/lib/utils";

/** VibeFunding mark: capital → compute → proof node */
export function VibeMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="12" fill="url(#vf-bg)" />
      <path
        d="M8 26C12 18 16 14 20 14C24 14 28 18 32 26"
        stroke="url(#vf-flow)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="22" r="2.2" fill="#22d3ee" />
      <circle cx="20" cy="14" r="2.6" fill="#fff" />
      <circle cx="28" cy="22" r="2.2" fill="#a78bfa" />
      <path
        d="M16 28.5h8"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="vf-bg" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#3b6ef5" />
          <stop offset="1" stopColor="#7c5cfc" />
        </linearGradient>
        <linearGradient id="vf-flow" x1="8" y1="14" x2="32" y2="26">
          <stop stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VibeWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <VibeMark size={32} />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">VibeFunding</div>
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Agentic capital
        </div>
      </div>
    </div>
  );
}
