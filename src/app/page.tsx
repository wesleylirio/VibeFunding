import { IndexHeader } from "@/components/index/index-header";
import { SectionBridge } from "@/components/index/section-bridge";
import { ProductFlow } from "@/components/index/product-flow";
import { VibeComputeCinematic } from "@/components/index/vibe-compute-cinematic";
import { GemmaSection } from "@/components/index/gemma-section";
import { ProofSection } from "@/components/index/proof-section";
import { RewardsSection } from "@/components/index/rewards-section";
import { CommunitySection } from "@/components/index/community-section";
import { FinalCTA, IndexFooter } from "@/components/index/final-cta";

/**
 * Experiment: cinematic video-scroll IS the hero.
 * How it works clarifies the loop, then the rest of the story.
 */
export default function LandingPage() {
  return (
    <div className="vf-index-bg min-h-screen text-foreground">
      <IndexHeader />
      <main>
        {/* 1 — Hero: VIBE → AMD → agents (scroll story) */}
        <VibeComputeCinematic />
        <SectionBridge />
        {/* 2 — Clarifies the product loop */}
        <ProductFlow />
        {/* 3 — Rest of the narrative */}
        <GemmaSection />
        <ProofSection />
        <RewardsSection />
        <CommunitySection />
        <FinalCTA />
      </main>
      <IndexFooter />
    </div>
  );
}
