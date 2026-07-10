import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMetric(key: string, value: number): { label: string; display: string } {
  const map: Record<string, (v: number) => { label: string; display: string }> = {
    users: (v) => ({ label: "Users", display: formatCompact(v) }),
    mrr: (v) => ({ label: "MRR", display: formatCurrency(v, true) }),
    commits: (v) => ({ label: "Commits", display: formatNumber(v) }),
    tests: (v) => ({ label: "Tests", display: formatNumber(v) }),
    uptime: (v) => ({ label: "Uptime", display: `${v}%` }),
  };
  return (
    map[key]?.(value) ?? {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      display: formatCompact(value),
    }
  );
}

export function truncateHash(hash: string, size = 6): string {
  if (hash.length <= size * 2 + 3) return hash;
  return `${hash.slice(0, size)}…${hash.slice(-size)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Minimal safe markdown-ish rendering helpers for product text */
export function stripMarkdownMarkers(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1");
}
