"use client";

import { useEffect, useState } from "react";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SectionEyebrow, SectionShell } from "./section-shell";

const BENEFITS = [
  {
    title: "Project tokens",
    body: "Receive exposure to the projects you helped move forward.",
  },
  {
    title: "Proof of Build",
    body: "See completed tasks, tests, commits, artifacts, and verified outcomes.",
  },
  {
    title: "Access and benefits",
    body: "Unlock project-defined NFTs, product access, community privileges, and holder benefits.",
  },
  {
    title: "Portfolio intelligence",
    body: "Track your projects, rewards, milestones, risks, and recent progress in one place.",
  },
];

export function RewardsSection() {
  return (
    <SectionShell id="rewards" wash="rewards">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="lg:order-2">
          <Reveal>
            <SectionEyebrow>What you receive</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-4xl">
              More than a token balance.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              Your portfolio connects every investment to the work it helped
              produce—ownership, access, and proof in one place.
            </p>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={0.07}>
            {BENEFITS.map((b) => (
              <RevealItem key={b.title}>
                <div className="rounded-xl border border-[rgba(232,60,255,0.22)] bg-[rgba(232,60,255,0.05)] p-4">
                  <h3 className="font-display text-sm font-semibold">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {b.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.12}>
            <p className="mt-5 text-xs text-muted-foreground">
              Project rewards vary by project. Proof of Build verifies recorded
              execution and evidence—it does not guarantee financial
              performance.
            </p>
          </Reveal>
        </div>
        <Reveal y={40} delay={0.1} className="lg:order-1">
          <RewardsVault />
        </Reveal>
      </div>
    </SectionShell>
  );
}

function RewardsVault() {
  const rewards = ["TOKENS", "ACCESS", "PROOF", "NFT"];
  const portfolioValue = usePortfolioValue();

  return (
    <div
      className="rewards-vault-stage aspect-[4/3]"
      role="img"
      aria-label="Animated portfolio vault distributing project rewards"
    >
      <div className="rewards-vault-grid" />
      <div className="rewards-vault-orbit" />
      <div className="rewards-vault-core">
        <div className="rewards-vault-v">V</div>
        <strong>{portfolioValue.toLocaleString("en-US")}</strong>
        <span>PORTFOLIO VALUE</span>
      </div>
      {rewards.map((reward, index) => (
        <div
          key={reward}
          className={`rewards-vault-chip rewards-vault-chip-${index + 1}`}
        >
          <i />
          {reward}
        </div>
      ))}
      <div className="rewards-vault-ticker">
        <span>COLLABMESH</span>
        <strong>+12.8%</strong>
        <span>PROOF VERIFIED</span>
      </div>
    </div>
  );
}

function usePortfolioValue() {
  const limit = 99_999_999;
  const [value, setValue] = useState(2_480);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((current) =>
        Math.min(limit, current + Math.max(137, Math.floor(current * 0.0008)))
      );
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  return value;
}
