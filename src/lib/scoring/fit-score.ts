import { RevenueFitScore } from "../schemas/sprint";

export interface ScoreInputs {
  speedToFirstRevenue: number; // 0-10
  abilityToReachBuyers: number; // 0-10
  founderFit: number; // 0-10
  painUrgency: number; // 0-10
  lowStartupCost: number; // 0-10
  executionSimplicity: number; // 0-10
  repeatRevenuePotential?: number; // 0-10, optional, used in growth mode
  whyThisScore: string[];
  biggestRisk: string;
  fastestValidationStep: string;
}

/**
 * Calculates the total fit score based on weighted categories:
 * Supports two modes:
 * MVP Mode (default):
 * - Speed to first revenue: 25%
 * - Ability to reach buyers: 20%
 * - Founder fit: 20%
 * - Pain urgency: 15%
 * - Low startup cost: 10%
 * - Execution simplicity: 10%
 *
 * Growth Mode:
 * - Speed to first revenue: 10%
 * - Ability to reach buyers: 25%
 * - Founder fit: 15%
 * - Pain urgency: 15%
 * - Execution simplicity: 15%
 * - Repeat revenue potential: 20%
 */
export function calculateFitScore(inputs: ScoreInputs, mode: "mvp" | "growth" = "mvp"): RevenueFitScore {
  // Clamp values between 0 and 10
  const clamp = (val: number) => Math.min(Math.max(val, 0), 10);

  const speed = clamp(inputs.speedToFirstRevenue);
  const reach = clamp(inputs.abilityToReachBuyers);
  const fit = clamp(inputs.founderFit);
  const urgency = clamp(inputs.painUrgency);
  const cost = clamp(inputs.lowStartupCost);
  const simplicity = clamp(inputs.executionSimplicity);
  const repeat = clamp(inputs.repeatRevenuePotential ?? 5); // Default to 5 if not provided

  let weightedSum = 0;

  if (mode === "growth") {
    // Total score = (speed * 1.0) + (reach * 2.5) + (fit * 1.5) + (urgency * 1.5) + (simplicity * 1.5) + (repeat * 2.0)
    weightedSum =
      speed * 1.0 +
      reach * 2.5 +
      fit * 1.5 +
      urgency * 1.5 +
      simplicity * 1.5 +
      repeat * 2.0;
  } else {
    // Total score = (speed * 2.5) + (reach * 2.0) + (fit * 2.0) + (urgency * 1.5) + (cost * 1.0) + (simplicity * 1.0)
    weightedSum =
      speed * 2.5 +
      reach * 2.0 +
      fit * 2.0 +
      urgency * 1.5 +
      cost * 1.0 +
      simplicity * 1.0;
  }

  // Since maximum sum is 100 (when all scores are 10), we can just round the weightedSum
  const total = Math.round(weightedSum);

  return {
    total,
    speedToFirstRevenue: speed,
    abilityToReachBuyers: reach,
    founderFit: fit,
    painUrgency: urgency,
    lowStartupCost: cost,
    executionSimplicity: simplicity,
    repeatRevenuePotential: mode === "growth" ? repeat : undefined,
    whyThisScore: inputs.whyThisScore,
    biggestRisk: inputs.biggestRisk,
    fastestValidationStep: inputs.fastestValidationStep,
  };
}
