import { GemmaOrb } from "@/components/gemma/gemma-orb";

export default function GemmaLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-live="polite">
      <section className="card-surface card-glow p-6 md:p-8">
        <div className="flex items-center gap-3">
          <GemmaOrb size={48} state="analyzing" pulse />
          <div>
            <div className="text-xs font-medium tracking-[0.14em] text-gemma">
              Decision intelligence
            </div>
            <h1 className="mt-1 font-display text-2xl font-semibold">
              Gemma is reading your portfolio
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Mapping holdings, Proofs of Build, risk signals, and opportunity fit…
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-[560px]" />
      </div>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return (
    <div className={`card-surface animate-pulse overflow-hidden p-5 ${className}`}>
      <div className="h-3 w-28 rounded bg-gemma/20" />
      <div className="mt-4 h-6 w-2/3 rounded bg-muted" />
      <div className="mt-5 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
    </div>
  );
}
