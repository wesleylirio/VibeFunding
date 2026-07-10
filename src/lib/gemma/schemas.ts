import { z } from "zod";

export const gemmaInsightSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  risks: z.array(z.string()).optional().default([]),
  strengths: z.array(z.string()).optional().default([]),
  questions: z.array(z.string()).optional().default([]),
  portfolioImpact: z.string().optional(),
  sources: z.array(z.string()).optional().default([]),
  importantChanges: z.array(z.string()).optional(),
  projectsNeedingAttention: z.array(z.string()).optional(),
  opportunitySuggestions: z.array(z.string()).optional(),
  executionAssessment: z.string().optional(),
  buildRoundAssessment: z.string().optional(),
  portfolioRelevance: z.string().optional(),
  whatWasFunded: z.string().optional(),
  whatWasProduced: z.string().optional(),
  whatEvidenceExists: z.string().optional(),
  whatRemainsUnverified: z.string().optional(),
});

export const founderAssistSchema = z.object({
  content: z.string().min(1),
  missingFields: z.array(z.string()).optional().default([]),
  suggestions: z.array(z.string()).optional().default([]),
  sensitiveHints: z.array(z.string()).optional().default([]),
  draftUpdate: z.string().optional(),
});

export const quickstartDraftSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  pitch: z.string().min(1),
  description: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  audience: z.string().min(1),
  stage: z.string().min(1),
  branding: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  buildRound: z.object({
    title: z.string().min(1),
    objective: z.string().min(1),
    deliverables: z.array(z.string()).min(1),
    sprintDraft: z.array(z.string()).optional().default([]),
    resources: z
      .array(
        z.object({
          type: z.string(),
          label: z.string(),
          amount: z.number(),
          unit: z.string(),
        })
      )
      .optional()
      .default([]),
    estimatedBuildUnits: z.number().optional().default(10000),
    risks: z.array(z.string()).optional().default([]),
    returns: z
      .array(
        z.object({
          type: z.string(),
          title: z.string(),
          description: z.string(),
        })
      )
      .optional()
      .default([]),
  }),
  token: z.object({
    symbol: z.string().min(1),
    name: z.string().min(1),
  }),
  nft: z.object({
    name: z.string().min(1),
    utility: z.array(z.string()).optional().default([]),
  }),
  investorSummary: z.string().min(1),
  onePaper: z.string().min(1),
});

export type ValidatedGemmaInsight = z.infer<typeof gemmaInsightSchema>;
export type ValidatedFounderAssist = z.infer<typeof founderAssistSchema>;
export type ValidatedQuickstartDraft = z.infer<typeof quickstartDraftSchema>;

/** Extract first JSON object/array from model text. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* continue */
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error("No JSON object found in model output");
}
