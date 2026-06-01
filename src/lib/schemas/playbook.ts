import { z } from "zod";

export const playbookCategorySchema = z.enum([
  "diagnostic_offer",
  "productized_service",
  "implementation_service",
  "consulting",
  "local_business",
  "digital_product",
  "creator_offer",
  "micro_saas_presales",
]);

export const levelSchema = z.enum(["none", "low", "medium", "high"]);
export const trustSchema = z.enum(["low", "medium", "high"]);
export const speedSchema = z.enum(["fast", "medium", "slow"]);
export const difficultySchema = z.enum(["low", "medium", "high"]);

export const playbookSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  category: playbookCategorySchema,
  summary: z.string(),
  bestFor: z.array(z.string()),
  notFor: z.array(z.string()).optional(),
  targetCustomers: z.array(z.string()),
  painfulProblem: z.string(),
  promisedOutcome: z.string(),
  priceRange: z.object({
    currency: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
    note: z.string().optional(),
  }),
  requiredSkills: z.array(z.string()),
  requiredAssets: z.array(z.string()).optional(),
  startupCostLevel: levelSchema,
  trustRequired: trustSchema,
  speedToFirstRevenue: speedSchema,
  executionDifficulty: difficultySchema,
  firstChannels: z.array(z.string()),
  firstOffer: z.object({
    name: z.string(),
    promise: z.string(),
    deliverables: z.array(z.string()),
    exclusions: z.array(z.string()),
    callToAction: z.string(),
  }),
  first7DaySprint: z.object({
    goal: z.string(),
    dailyActions: z.array(
      z.object({
        day: z.number(),
        objective: z.string(),
        actions: z.array(z.string()),
      })
    ),
  }),
  metrics: z.array(z.string()),
  risks: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  improvements: z.array(z.string()),
  exampleMessages: z.array(z.string()).optional(),
  reviewQuestions: z.array(z.string()),
});

export type RevenuePlaybook = z.infer<typeof playbookSchema>;
export type PlaybookCategory = z.infer<typeof playbookCategorySchema>;
