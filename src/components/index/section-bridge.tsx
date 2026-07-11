/**
 * Quiet red/obsidian handoff between the cinematic and product flow.
 */
export function SectionBridge() {
  return (
    <div className="relative z-[1] h-16 overflow-hidden md:h-24" aria-hidden>
      <div className="absolute inset-0 bg-[#070708]" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 120% at 50% 50%, rgba(255,59,71,0.2), transparent 55%), radial-gradient(ellipse 55% 100% at 75% 50%, rgba(255,90,61,0.1), transparent 50%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-px w-[min(280px,55vw)] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,59,71,0.7), rgba(255,255,255,0.42), rgba(255,90,61,0.5), transparent)",
          boxShadow: "0 0 18px rgba(255, 59, 71, 0.22)",
        }}
      />
    </div>
  );
}
