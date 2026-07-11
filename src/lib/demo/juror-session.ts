import { cookies } from "next/headers";
import type { DemoRole } from "@/lib/types";

export const JUROR_COOKIE = "vf_juror";

export type InvestorPreferences = {
  interests: string[];
  stage: string;
  risk: string;
  resources: string[];
  priorities: string[];
  completedAt: string;
};

export type JurorSession = {
  loggedIn: boolean;
  displayName: string;
  initials: string;
  role: DemoRole;
  onboardingSeen: boolean;
  founderQuickstartSeen: boolean;
  investorPreferences?: InvestorPreferences | null;
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "IN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function defaultJurorSession(): JurorSession {
  return {
    loggedIn: false,
    displayName: "",
    initials: "",
    role: "INVESTOR",
    onboardingSeen: false,
    founderQuickstartSeen: false,
    investorPreferences: null,
  };
}

function parsePreferences(
  raw: unknown
): InvestorPreferences | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<InvestorPreferences>;
  if (!Array.isArray(p.interests) || !p.stage || !p.risk || !p.completedAt) {
    return null;
  }
  return {
    interests: p.interests.map(String).slice(0, 8),
    stage: String(p.stage).slice(0, 40),
    risk: String(p.risk).slice(0, 40),
    resources: Array.isArray(p.resources)
      ? p.resources.map(String).slice(0, 8)
      : [],
    priorities: Array.isArray(p.priorities)
      ? p.priorities.map(String).slice(0, 8)
      : [],
    completedAt: String(p.completedAt),
  };
}

export function parseJurorCookie(raw: string | undefined): JurorSession {
  if (!raw) return defaultJurorSession();
  try {
    const data = JSON.parse(raw) as Partial<JurorSession>;
    if (!data.loggedIn || !data.displayName) return defaultJurorSession();
    return {
      loggedIn: true,
      displayName: String(data.displayName).slice(0, 64),
      initials:
        data.initials || initialsFromName(String(data.displayName)),
      role: data.role === "FOUNDER" ? "FOUNDER" : "INVESTOR",
      onboardingSeen: Boolean(data.onboardingSeen),
      founderQuickstartSeen: Boolean(data.founderQuickstartSeen),
      investorPreferences: parsePreferences(data.investorPreferences),
    };
  } catch {
    return defaultJurorSession();
  }
}

export async function getJurorSession(): Promise<JurorSession> {
  const jar = await cookies();
  return parseJurorCookie(jar.get(JUROR_COOKIE)?.value);
}

export function serializeJurorSession(session: JurorSession): string {
  return JSON.stringify(session);
}
