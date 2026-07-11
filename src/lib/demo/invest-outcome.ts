/** Session key for post-invest demo handoff → Proof of Build rewards. */
export const INVEST_OUTCOME_KEY = "vf-invest-outcome";

export type InvestOutcome = {
  projectSlug: string;
  projectName: string;
  proofId: string;
  amount: number;
  tokens: number;
  tokenSymbol: string;
  amdGpuHours: number;
  supportersCount: number;
  nft?: {
    name: string;
    imageEmoji: string;
    rarity: string;
  } | null;
  createdAt: string;
};

export function saveInvestOutcome(outcome: InvestOutcome) {
  try {
    sessionStorage.setItem(INVEST_OUTCOME_KEY, JSON.stringify(outcome));
  } catch {
    /* ignore */
  }
}

export function readInvestOutcome(): InvestOutcome | null {
  try {
    const raw = sessionStorage.getItem(INVEST_OUTCOME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvestOutcome;
  } catch {
    return null;
  }
}

export function clearInvestOutcome() {
  try {
    sessionStorage.removeItem(INVEST_OUTCOME_KEY);
  } catch {
    /* ignore */
  }
}
