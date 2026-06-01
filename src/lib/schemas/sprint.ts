import { z } from "zod";
import { offerSchema } from "./offer";

export const channelPlanSchema = z.object({
  primaryChannel: z.string(),
  secondaryChannel: z.string().optional(),
  whyThisChannel: z.string(),
  firstProspectListInstructions: z.array(z.string()),
  dailyOutreachLimit: z.number(),
  personalizationRules: z.array(z.string()),
  complianceNotes: z.array(z.string()),
});

export const sprintDaySchema = z.object({
  day: z.number(),
  objective: z.string(),
  actions: z.array(z.string()),
  expectedOutput: z.string(),
  timeEstimateMinutes: z.number(),
});

export const outreachMessageSchema = z.object({
  type: z.string(),
  label: z.string(),
  content: z.string(),
  instructions: z.string().optional(),
});

export const sprintMetricsSchema = z.object({
  prospectsListed: z.number().default(0),
  messagesSent: z.number().default(0),
  replies: z.number().default(0),
  callsBooked: z.number().default(0),
  callsCompleted: z.number().default(0),
  offersSent: z.number().default(0),
  paymentsReceived: z.number().default(0),
  revenueAmount: z.number().default(0),
  bestReplySource: z.string().optional(),
  biggestBlocker: z.string().optional(),
  notes: z.string().optional(),
});

export const sprintSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  goal: z.string(),
  hypothesis: z.string(),
  offer: offerSchema,
  targetAudience: z.string(),
  channelPlan: channelPlanSchema,
  dailyActions: z.array(sprintDaySchema),
  outreachMessages: z.array(outreachMessageSchema),
  metrics: sprintMetricsSchema.optional(),
  reviewQuestions: z.array(z.string()),
  nextExperimentOptions: z.array(z.string()),
});

export const fitScoreSchema = z.object({
  total: z.number(),
  speedToFirstRevenue: z.number(),
  abilityToReachBuyers: z.number(),
  founderFit: z.number(),
  painUrgency: z.number(),
  lowStartupCost: z.number(),
  executionSimplicity: z.number(),
  whyThisScore: z.array(z.string()),
  biggestRisk: z.string(),
  fastestValidationStep: z.string(),
});

export type ChannelPlan = z.infer<typeof channelPlanSchema>;
export type SprintDay = z.infer<typeof sprintDaySchema>;
export type OutreachMessage = z.infer<typeof outreachMessageSchema>;
export type SprintMetrics = z.infer<typeof sprintMetricsSchema>;
export type RevenueSprint = z.infer<typeof sprintSchema>;
export type RevenueFitScore = z.infer<typeof fitScoreSchema>;
