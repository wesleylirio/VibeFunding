import { MessageCircle, Users } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SectionEyebrow, SectionShell } from "./section-shell";

const ITEMS = [
  "Founder updates",
  "Investor discussions",
  "Milestone celebrations",
  "Proof-linked progress",
];

export function CommunitySection() {
  return (
    <SectionShell id="community" wash="community">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Reveal>
            <SectionEyebrow>Build together</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
              Join the people behind the progress.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Follow founder updates, discuss milestones, react to new Proofs of
              Build, and connect with other investors supporting the same
              project.
            </p>
          </Reveal>
          <RevealGroup className="mt-6 grid gap-2 sm:grid-cols-2" stagger={0.06}>
            {ITEMS.map((item) => (
              <RevealItem key={item}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0 text-[var(--vf-violet)]" />
                  {item}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal y={36} delay={0.1}>
          <div className="community-network-stage">
            <div className="community-network-lines" aria-hidden>
              <i /><i /><i /><i /><i /><i />
            </div>
            <div className="community-network-avatars" aria-hidden>
              {["founder", "builder", "investor", "designer", "agent", "holder"].map((label, index) => (
                <span key={label} className={`community-avatar community-avatar-${index + 1}`}>
                  <i />
                  <b />
                  <em />
                </span>
              ))}
            </div>
          <article className="community-live-card rounded-2xl border border-border bg-[rgba(18,16,20,0.9)] p-5 shadow-[var(--vf-shadow-md)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="founder-face" aria-label="Founder avatar">
                <span className="founder-face-hair" />
                <span className="founder-face-eye founder-face-eye-left" />
                <span className="founder-face-eye founder-face-eye-right" />
                <span className="founder-face-smile" />
              </div>
              <div>
                <p className="text-sm font-semibold">Founder update</p>
                <p className="text-[11px] text-muted-foreground">
                  CollabMesh · Build Round 3
                </p>
              </div>
              <span className="ml-auto rounded-full border border-[rgba(130,104,255,0.4)] px-2 py-0.5 text-[10px] font-medium text-[var(--vf-violet)]">
                New Proof
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Agents shipped the collab graph API milestone. Proof linked below
              — tests passed, compute reconciled, token unlock scheduled.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 text-[var(--vf-coral)]">
                ● 12 holders celebrated
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--vf-violet)]">
                <MessageCircle className="h-3 w-3" /> 8 replies
              </span>
              <span className="rounded-full bg-[rgba(232,60,255,0.12)] px-2 py-0.5 text-[var(--vf-magenta)]">
                Token holder
              </span>
            </div>
          </article>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
