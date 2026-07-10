import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  color,
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${v}%`,
          background: color
            ? `linear-gradient(90deg, ${color}, ${color}cc)`
            : "linear-gradient(90deg, #5b8cff, #a78bfa)",
        }}
      />
    </div>
  );
}
