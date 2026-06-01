import { z } from "zod";

export const bottleneckEnum = z.enum([
  "prospecting",
  "message",
  "offer",
  "trust",
  "pricing",
  "sales_call",
  "delivery",
  "unknown",
]);

export const reviewSchema = z.object({
  summary: z.string(),
  whatWorked: z.array(z.string()),
  whatDidNotWork: z.array(z.string()),
  bottleneck: bottleneckEnum,
  evidence: z.array(z.string()),
  recommendation: z.string(),
  nextSprint: z.object({
    keep: z.array(z.string()),
    change: z.array(z.string()),
    test: z.array(z.string()),
  }),
});

export type WeeklyReview = z.infer<typeof reviewSchema>;
export type Bottleneck = z.infer<typeof bottleneckEnum>;
export type ReviewTableInsert = {
  id: string;
  sprintId: string;
  summary: string;
  whatWorked: string; // JSON
  whatDidNotWork: string; // JSON
  bottleneck: string;
  evidence: string; // JSON
  recommendation: string;
  nextSprint: string; // JSON
  createdAt: number;
};
