import { z } from "zod";

export const startupBudgetLevelSchema = z.enum(["none", "low", "medium"]);
export const salesComfortLevelSchema = z.enum(["low", "medium", "high"]);
export const preferredWorkTypeSchema = z.enum([
  "service",
  "consulting",
  "automation",
  "content",
  "local",
  "not_sure",
]);

export const segmentSchema = z.enum([
  "freelance",
  "ai_consulting",
  "local_business",
  "digital_product",
  "creator",
  "microsaas",
  "agency",
  "career",
]);

export const profileSchema = z.object({
  location: z.string().optional(),
  language: z.enum(["en", "ru"]),
  targetMonthlyIncome: z.number().optional(),
  currency: z.string().optional(),
  marketResearchNotes: z.string().optional(),
  segment: segmentSchema.default("freelance"),
  skills: z.array(z.string()),
  pastExperience: z.array(z.string()),
  availableHoursPerWeek: z.number().min(1).max(168),
  startupBudgetLevel: startupBudgetLevelSchema,
  audienceAccess: z.array(z.string()),
  salesComfortLevel: salesComfortLevelSchema,
  preferredWorkType: preferredWorkTypeSchema,
  constraints: z.array(z.string()),
});

export type FounderProfileLite = z.infer<typeof profileSchema>;
export type StartupBudgetLevel = z.infer<typeof startupBudgetLevelSchema>;
export type SalesComfortLevel = z.infer<typeof salesComfortLevelSchema>;
export type PreferredWorkType = z.infer<typeof preferredWorkTypeSchema>;
export type Segment = z.infer<typeof segmentSchema>;
