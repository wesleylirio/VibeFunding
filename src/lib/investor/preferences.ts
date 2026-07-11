import type { InvestorPreferences } from "@/lib/demo/juror-session";

export const INTEREST_OPTIONS = [
  "Developer tools",
  "AI infrastructure",
  "Consumer products",
  "Education",
  "Climate",
  "Creative technology",
] as const;

export const STAGE_OPTIONS = [
  { id: "Early", label: "Early" },
  { id: "Growing", label: "Growing" },
  { id: "Revenue-generating", label: "Revenue-generating" },
  { id: "Any", label: "Any stage" },
] as const;

export const RISK_OPTIONS = [
  { id: "Lower", label: "Lower" },
  { id: "Balanced", label: "Balanced" },
  { id: "Higher", label: "Higher" },
] as const;

/** Preference options about compute-backed outcomes (contributions use VIBE). */
export const RESOURCE_PREF_OPTIONS = [
  { id: "AMD_GPU", label: "AMD GPU-backed agent work" },
  { id: "Verified shipping", label: "Verified shipping & proofs" },
  { id: "Fast execution", label: "Fast Build Round execution" },
  { id: "Any", label: "Any of the above" },
] as const;

export const PRIORITY_OPTIONS = [
  { id: "Financial upside", label: "Financial upside" },
  { id: "Product impact", label: "Product impact" },
  { id: "Open-source contribution", label: "Open-source contribution" },
  { id: "Community access", label: "Community access" },
  { id: "Technical innovation", label: "Technical innovation" },
] as const;

/** Demo hero set — primary Discover experience shows these first. */
export const DEMO_PRIMARY_SLUGS = [
  "collabmesh",
  "inferlane",
  "auditforge",
  "vectoryard",
  "gpuharbor",
] as const;

type MatchableProject = {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  stage: string;
  logoEmoji: string;
  accentColor: string;
  detailed: boolean;
  proofCount: number;
  returnTitles: string[];
  activeRound: {
    title: string;
    status: string;
    progress: number;
    fundedValue: number;
    targetValue: number;
  } | null;
};

export type ProjectMatch = MatchableProject & {
  matchReason: string;
  matchFactors: string[];
  mainRisk: string;
};

function stageScore(pref: string, projectStage: string): number {
  if (pref === "Any") return 1;
  const s = projectStage.toLowerCase();
  if (pref === "Early" && (s.includes("seed") || s.includes("early") || s.includes("pre")))
    return 3;
  if (pref === "Growing" && (s.includes("growth") || s.includes("series") || s.includes("expand")))
    return 3;
  if (
    pref === "Revenue-generating" &&
    (s.includes("revenue") || s.includes("growth") || s.includes("series"))
  )
    return 3;
  return 0;
}

function categoryScore(interests: string[], category: string): number {
  const cat = category.toLowerCase();
  let score = 0;
  for (const i of interests) {
    const t = i.toLowerCase();
    if (cat.includes(t) || t.includes(cat.split(" ")[0] || "")) score += 3;
    if (t.includes("developer") && (cat.includes("developer") || cat.includes("tool")))
      score += 3;
    if (t.includes("ai") && (cat.includes("ai") || cat.includes("infra") || cat.includes("ml")))
      score += 3;
    if (t.includes("climate") && cat.includes("climate")) score += 3;
    if (t.includes("education") && cat.includes("edu")) score += 3;
    if (t.includes("consumer") && cat.includes("consumer")) score += 3;
    if (t.includes("creative") && (cat.includes("creative") || cat.includes("media")))
      score += 3;
  }
  return score;
}

/**
 * Rank projects for Gemma suggestions.
 * Pass only projects the investor has NOT funded yet (exclude held stakes).
 */
export function rankProjectMatches(
  projects: MatchableProject[],
  prefs: InvestorPreferences,
  options?: { excludeSlugs?: Iterable<string>; excludeIds?: Iterable<string> }
): ProjectMatch[] {
  const excludeSlugs = new Set(options?.excludeSlugs ?? []);
  const excludeIds = new Set(options?.excludeIds ?? []);
  const pool = projects.filter((p) => {
    if (excludeSlugs.has(p.slug)) return false;
    // id is optional on MatchableProject but present on list rows
    const id = (p as { id?: string }).id;
    if (id && excludeIds.has(id)) return false;
    return true;
  });

  const scored = pool.map((p) => {
    let score = 0;
    const factors: string[] = [];

    const cat = categoryScore(prefs.interests, p.category);
    if (cat > 0) {
      score += cat;
      factors.push("Strong category match");
    }

    const st = stageScore(prefs.stage, p.stage);
    score += st;
    if (st >= 2) factors.push(`${p.stage} stage`);

    if (prefs.risk === "Lower" && p.proofCount > 0) {
      score += 2;
      factors.push(`${p.proofCount} verified Proof${p.proofCount > 1 ? "s" : ""}`);
    } else if (prefs.risk === "Higher" && p.detailed) {
      score += 1;
    } else if (prefs.risk === "Balanced") {
      score += 1;
      factors.push("Balanced risk");
    }

    if (p.activeRound) {
      score += 2;
      factors.push("Active Build Round");
    }

    if (p.proofCount > 0 && !factors.some((f) => f.includes("Proof"))) {
      factors.push(`${p.proofCount} verified Proof${p.proofCount > 1 ? "s" : ""}`);
      score += 1;
    }

    if (
      prefs.resources.some(
        (r) => r === "AMD_GPU" || r === "Any" || r === "Fast execution"
      ) &&
      (p.slug === "inferlane" || p.slug === "gpuharbor" || p.slug === "collabmesh")
    ) {
      factors.push("VIBE funds AMD GPU Cloud Credits");
      score += 2;
    }

    if (
      prefs.resources.some((r) => r === "Verified shipping") &&
      p.proofCount > 0
    ) {
      score += 1;
    }

    const interestLabel = prefs.interests.slice(0, 2).join(" and ").toLowerCase();
    const matchReason = `${p.name} matches your preference for ${
      prefs.stage === "Any" ? "" : prefs.stage.toLowerCase() + " "
    }${interestLabel || "projects"}${
      p.activeRound ? " with an active Build Round" : ""
    }${p.proofCount > 0 ? " and verified shipping history" : ""}.`;

    const mainRisk =
      prefs.risk === "Lower" && p.proofCount === 0
        ? "Limited verified execution history so far."
        : p.activeRound && p.activeRound.progress < 40
          ? "Current Build Round is still early in funding."
          : "Execution risk remains; review deliverables and evidence carefully.";

    return {
      ...p,
      _score: score,
      matchReason,
      matchFactors: factors.slice(0, 5),
      mainRisk,
    };
  });

  return scored
    .sort((a, b) => b._score - a._score || b.proofCount - a.proofCount)
    .slice(0, 4)
    .map(({ _score: _, ...rest }) => rest);
}
