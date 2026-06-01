import { z } from "zod";

export const offerSchema = z.object({
  name: z.string(),
  targetCustomer: z.string(),
  painfulProblem: z.string(),
  promisedOutcome: z.string(),
  timeframe: z.string(),
  mechanism: z.string(),
  deliverables: z.array(z.string()),
  exclusions: z.array(z.string()),
  priceRange: z.string(),
  proofNeeded: z.array(z.string()),
  trustBuilders: z.array(z.string()),
  objections: z.array(z.string()),
  callToAction: z.string(),
});

export type OfferDraft = z.infer<typeof offerSchema>;
export type Offer = OfferDraft & { id: string; revenuePathId: string };
