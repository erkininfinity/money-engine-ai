import { z } from "zod";
import { fitScoreSchema } from "./sprint";

export const generatedPathSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  targetCustomers: z.array(z.string()),
  pain: z.string(),
  firstOfferExample: z.string(),
  score: fitScoreSchema,
  risks: z.array(z.string()),
  firstChannels: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const pathsResponseSchema = z.object({
  paths: z.array(generatedPathSchema),
});

export type GeneratedPath = z.infer<typeof generatedPathSchema>;
export type PathsResponse = z.infer<typeof pathsResponseSchema>;
