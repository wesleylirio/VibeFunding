import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VibeWordmark } from "@/components/brand/logo";
import { Reveal } from "./reveal";

export function FinalCTA() {
  return (
    <section className="vf-index-section px-4 md:px-8">
      <Reveal y={40} className="vf-final-cta relative mx-auto max-w-[var(--vf-index-max-width)] overflow-hidden rounded-3xl border border-[rgba(255,59,71,0.28)] px-6 py-12 text-center shadow-[var(--vf-shadow-lg)] md:px-12 md:py-16">
        {/* Base dark backdrop */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(145deg,#10090b,#070708 68%)" }} aria-hidden />
        {/* Drifting energy clouds */}
        <div className="final-cta-cloud final-cta-cloud-1 pointer-events-none absolute" aria-hidden />
        <div className="final-cta-cloud final-cta-cloud-2 pointer-events-none absolute" aria-hidden />
        <div className="final-cta-cloud final-cta-cloud-3 pointer-events-none absolute" aria-hidden />
        <div className="final-cta-cloud final-cta-cloud-4 pointer-events-none absolute" aria-hidden />
        <div className="vf-final-cta-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="vf-final-cta-orbit pointer-events-none absolute" aria-hidden />

        <div className="relative z-[1]">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-4xl">
            The next startup milestone could start with you.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/70 md:text-base">
            Discover a project you believe in, turn VIBE into AMD-powered
            compute, and watch agents build something real.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="vf-btn-primary">
              Start investing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-8 text-sm font-medium tracking-wide text-white/90">
            Fund the build. Track the work. Earn project rewards.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export function IndexFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[var(--vf-index-max-width)] flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="max-w-md">
          <VibeWordmark size="sm" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            VibeFunding is a Web3 launchpad that turns investor participation
            into AMD-powered compute, agent execution, and verifiable startup
            progress.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Fund the build. Track the work. Earn project rewards.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <a href="#hero" className="hover:text-foreground">
            Story
          </a>
          <a href="#how-it-works" className="hover:text-foreground">
            How it works
          </a>
          <a href="#proof" className="hover:text-foreground">
            Proof of Build
          </a>
          <a href="#gemma" className="hover:text-foreground">
            Gemma
          </a>
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
