"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Shot = {
  id: string;
  poster: string;
};

const SHOTS: Shot[] = [
  {
    id: "hand",
    poster: "/brand/index/cine-01-hand.webp",
  },
  {
    id: "throw",
    poster: "/brand/index/cine-02-throw.webp",
  },
  {
    id: "spin",
    poster: "/brand/index/cine-03-spin.webp",
  },
  {
    id: "slot",
    poster: "/brand/index/cine-04-slot.webp",
  },
  {
    id: "gpus",
    poster: "/brand/index/cine-05-gpus.webp",
  },
  {
    id: "agents",
    poster: "/brand/index/cine-06-agents.webp",
  },
];

const N = SHOTS.length;
const HERO_VIDEO = "/brand/index/cine-hero.mp4";

/** One beat per shot — aligned to equal scroll segments */
const BEATS = [
  {
    eyebrow: "VibeFunding",
    title: "Fund startup builds with AMD-powered AI compute.",
    body: "Your VIBE is investment energy — committed to real product milestones, not vague promises.",
  },
  {
    eyebrow: "Commit",
    title: "Throw your capital into the build.",
    body: "You choose the project. Your VIBE leaves the wallet and enters the network.",
  },
  {
    eyebrow: "In flight",
    title: "From intent to infrastructure.",
    body: "Participation travels toward productive capacity — tracked, visible, on-path.",
  },
  {
    eyebrow: "Conversion",
    title: "VIBE docks into AMD compute.",
    body: "50 VIBE → 1 GPU hour. Your investment seats into a real compute key.",
  },
  {
    eyebrow: "AMD GPUs online",
    title: "Compute ignites.",
    body: "Neon power spreads across AMD GPU capacity — agent-ready, milestone-scoped.",
  },
  {
    eyebrow: "Agents build",
    title: "A workforce at product scale.",
    body: "Agents research, design, code, test, and ship — millions of micro-tasks driven by funded compute.",
  },
] as const;

/**
 * Hero: scroll scrubs the film in both directions.
 * No fog — video clear, text centered with shadow for legibility.
 */
export function VibeComputeCinematic() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const latestProgress = useRef(0);
  const seekFrame = useRef<number | null>(null);
  const isFinalLoopPlaying = useRef(false);
  const reduceMotion = useReducedMotion();
  const [activeBeat, setActiveBeat] = useState(0);
  const [hasScrubbed, setHasScrubbed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  // The film finishes before the sticky runway ends, reserving the final
  // stretch of scroll for the "See how it works" handoff.
  const progress = useTransform(scrollYProgress, [0, 0.88], [0, 1]);

  // One continuous, seek-optimised video: only one decoder follows the scroll.
  useMotionValueEvent(progress, "change", (p) => {
    setActiveBeat(progressToBeat(p));
    if (p > 0.002) setHasScrubbed(true);
    if (reduceMotion) return;
    latestProgress.current = p;

    if (p >= 0.999) {
      if (seekFrame.current !== null) {
        cancelAnimationFrame(seekFrame.current);
        seekFrame.current = null;
      }
      if (!isFinalLoopPlaying.current) {
        isFinalLoopPlaying.current = true;
        startFinalShotLoop(videoRef.current);
      }
      return;
    }

    if (isFinalLoopPlaying.current) {
      isFinalLoopPlaying.current = false;
      videoRef.current?.pause();
    }
    if (seekFrame.current !== null) return;
    seekFrame.current = requestAnimationFrame(() => {
      seekFrame.current = null;
      syncVideoToProgress(videoRef.current, latestProgress.current);
    });
  });

  useEffect(() => {
    return () => {
      if (seekFrame.current !== null) cancelAnimationFrame(seekFrame.current);
    };
  }, []);

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.015], [1, 0]);
  const nextHintOpacity = useTransform(scrollYProgress, [0.89, 0.97], [0, 1]);
  const nextHintY = useTransform(scrollYProgress, [0.89, 0.97], [28, 0]);

  return (
    <section
      id="hero"
      className="relative scroll-mt-0"
      aria-label="VibeFunding — from VIBE to AMD compute to agents"
    >
      <div
        ref={runwayRef}
        className="relative h-[min(730vh,6000px)] md:h-[min(680vh,5800px)]"
      >
        <div className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-[#070708]">
          {/* Single continuous film — no competing video decoders */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-[#070708]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SHOTS[0].poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {!reduceMotion ? (
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={HERO_VIDEO}
                muted
                playsInline
                preload="auto"
                poster={SHOTS[0].poster}
                onLoadedMetadata={(event) => {
                  event.currentTarget.pause();
                  const initialProgress = progress.get();
                  latestProgress.current = initialProgress;
                  if (initialProgress >= 0.999) {
                    isFinalLoopPlaying.current = true;
                    startFinalShotLoop(event.currentTarget);
                  } else {
                    syncVideoToProgress(event.currentTarget, initialProgress);
                  }
                }}
                onTimeUpdate={(event) => {
                  if (!isFinalLoopPlaying.current) return;
                  const video = event.currentTarget;
                  if (video.currentTime >= video.duration - 0.08) {
                    video.currentTime = finalShotStart(video);
                  }
                }}
                onEnded={(event) => {
                  if (!isFinalLoopPlaying.current) return;
                  startFinalShotLoop(event.currentTarget);
                }}
              />
            ) : null}
            {/* Exit wash only — red/coral into page, not purple */}
            <div
              className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, #070708 0%, rgba(7,7,8,0.55) 45%, transparent 100%)",
              }}
            />
          </div>

          {/* Centered text over clear video */}
          <div className="relative z-10 flex h-full items-center justify-center px-4 pb-24 pt-20 md:px-8">
            <div className="relative mx-auto min-h-[14rem] w-full max-w-3xl text-center md:min-h-[16rem] [text-shadow:0_2px_28px_rgba(0,0,0,0.75),0_1px_4px_rgba(0,0,0,0.9)]">
              <BeatCopy
                key={BEATS[activeBeat].eyebrow}
                beat={BEATS[activeBeat]}
                index={activeBeat}
                progress={progress}
                reduceMotion={!!reduceMotion}
              />
            </div>
          </div>

          <motion.p
            style={{ opacity: hasScrubbed ? 0 : scrollHintOpacity }}
            className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 md:bottom-20 [text-shadow:0_1px_12px_rgba(0,0,0,0.9)]"
          >
            Scroll to scrub the story
          </motion.p>

          <motion.a
            href="#how-it-works"
            style={{ opacity: nextHintOpacity, y: nextHintY }}
            className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition hover:border-[rgba(255,90,61,0.55)] hover:text-white md:bottom-20"
          >
            See how it works ↓
          </motion.a>

          <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-8">
            {SHOTS.map((shot, i) => (
              <ProgressDot
                key={shot.id}
                progress={progress}
                index={i}
                total={N}
              />
            ))}
          </div>
        </div>
      </div>

      <div id="compute" className="sr-only" aria-hidden />
      <div id="agents" className="sr-only" aria-hidden />
    </section>
  );
}

function syncVideoToProgress(video: HTMLVideoElement | null, progress: number) {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
  const target = Math.min(
    video.duration - 0.05,
    Math.max(0, progress) * video.duration
  );

  // Avoid restarting a seek for changes smaller than one source frame (24 fps).
  if (Math.abs(video.currentTime - target) >= 1 / 24) video.currentTime = target;
}

function finalShotStart(video: HTMLVideoElement) {
  return (video.duration * (N - 1)) / N;
}

function startFinalShotLoop(video: HTMLVideoElement | null) {
  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = finalShotStart(video);
  void video.play().catch(() => {
    // Muted inline playback is normally allowed; the last frame remains as fallback.
  });
}

function progressToBeat(progress: number) {
  return Math.min(N - 1, Math.floor(Math.max(0, progress) * N));
}

function BeatCopy({
  beat,
  index,
  progress,
  reduceMotion,
}: {
  beat: (typeof BEATS)[number];
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = index / N;
  const end = (index + 1) / N;
  const inEnd = start + (end - start) * 0.18;
  const outStart = end - (end - start) * 0.15;
  const isFirst = index === 0;
  const isLast = index === N - 1;

  const opacity = useTransform(
    progress,
    isFirst
      ? [0, outStart, end]
      : isLast
        ? [start, inEnd, 0.99, 1]
        : [start, inEnd, outStart, end],
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1, 1] : [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    isFirst ? [0, outStart, end] : [start, inEnd],
    reduceMotion ? [0, 0, 0] : isFirst ? [0, 0, -12] : [22, 0]
  );

  if (reduceMotion) {
    if (!isFirst) return null;
    return (
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--vf-coral)]">
          {beat.eyebrow}
        </p>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
          {beat.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
          {beat.body}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-2"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--vf-coral)] md:text-base">
        {beat.eyebrow}
      </p>
      <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
        {beat.title}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
        {beat.body}
      </p>
    </motion.div>
  );
}

function ProgressDot({
  progress,
  index,
  total,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const active = useTransform(progress, [start, end], [0.3, 1]);
  const width = useTransform(progress, [start, end], [6, 22]);

  return (
    <motion.div
      className="h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)]"
      style={{ opacity: active, width }}
    />
  );
}
