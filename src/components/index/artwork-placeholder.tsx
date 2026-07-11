import Image from "next/image";
import { cn } from "@/lib/utils";

export type ArtworkColorMode =
  | "brand"
  | "compute"
  | "gemma"
  | "proof"
  | "reward";

const MODE_CLASS: Record<ArtworkColorMode, string> = {
  brand: "vf-artwork-brand",
  compute: "vf-artwork-compute",
  gemma: "vf-artwork-gemma",
  proof: "vf-artwork-proof",
  reward: "vf-artwork-reward",
};

export function ArtworkPlaceholder({
  assetName,
  src,
  alt,
  aspectRatio = "4/3",
  priority = false,
  className,
  colorMode = "brand",
}: {
  assetName: string;
  src?: string;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
  className?: string;
  colorMode?: ArtworkColorMode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border shadow-[var(--vf-shadow-md)]",
        className
      )}
      style={{ aspectRatio }}
    >
      {src ? (
        <div className="absolute inset-0 bg-[var(--vf-obsidian)]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-3 p-6",
            MODE_CLASS[colorMode]
          )}
          role="img"
          aria-label={alt}
        >
          {/* Abstract network nodes — decorative */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute left-[18%] top-[28%] h-2 w-2 rounded-full bg-white/80" />
            <div className="absolute left-[42%] top-[42%] h-1.5 w-1.5 rounded-full bg-white/60" />
            <div className="absolute right-[22%] top-[32%] h-2.5 w-2.5 rounded-full bg-white/70" />
            <div className="absolute bottom-[28%] left-[32%] h-1.5 w-1.5 rounded-full bg-white/50" />
            <div className="absolute bottom-[36%] right-[28%] h-2 w-2 rounded-full bg-white/65" />
            <svg
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <line
                x1="20%"
                y1="30%"
                x2="42%"
                y2="42%"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <line
                x1="42%"
                y1="42%"
                x2="78%"
                y2="34%"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <line
                x1="42%"
                y1="42%"
                x2="34%"
                y2="70%"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <line
                x1="78%"
                y1="34%"
                x2="72%"
                y2="62%"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="relative z-[1] rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
            Build visual
          </div>
          {process.env.NODE_ENV === "development" ? (
            <p className="relative z-[1] max-w-[14rem] text-center font-mono text-[10px] text-white/55">
              {assetName}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
