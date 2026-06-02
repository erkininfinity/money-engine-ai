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

export type SegmentType =
  | "freelance"
  | "ai_consulting"
  | "local_business"
  | "digital_product"
  | "creator"
  | "microsaas"
  | "agency"
  | "career";

// Weights configuration: [speed, reach, fit, urgency, cost, simplicity]
const MVP_WEIGHTS: Record<SegmentType, [number, number, number, number, number, number]> = {
  freelance: [3.0, 2.0, 1.5, 1.5, 1.0, 1.0],
  ai_consulting: [2.0, 2.0, 2.5, 2.0, 0.5, 1.0],
  local_business: [2.5, 2.5, 1.0, 2.0, 1.0, 1.0],
  digital_product: [2.0, 1.5, 2.0, 1.5, 1.5, 1.5],
  creator: [1.5, 3.0, 2.5, 1.5, 0.5, 1.0],
  microsaas: [1.0, 2.0, 2.0, 3.0, 1.0, 1.0],
  agency: [2.0, 2.5, 1.5, 2.0, 0.5, 1.5],
  career: [1.5, 2.5, 3.0, 1.5, 0.5, 1.0],
};

// Weights configuration: [speed, reach, fit, urgency, simplicity, repeat]
const GROWTH_WEIGHTS: Record<SegmentType, [number, number, number, number, number, number]> = {
  freelance: [1.0, 2.5, 1.5, 1.5, 1.5, 2.0],
  ai_consulting: [1.0, 2.0, 2.0, 2.0, 1.0, 2.0],
  local_business: [1.0, 2.5, 1.0, 1.5, 1.5, 2.5],
  digital_product: [1.0, 2.0, 1.5, 1.5, 1.5, 2.5],
  creator: [1.0, 2.5, 2.0, 1.5, 1.0, 2.0],
  microsaas: [0.5, 2.0, 1.5, 2.5, 1.0, 2.5],
  agency: [1.0, 2.5, 1.5, 1.5, 1.5, 2.0],
  career: [1.0, 2.5, 2.5, 1.5, 1.0, 1.5],
};

/**
 * Calculates the total fit score based on segment-specific and mode-specific weights.
 */
export function calculateFitScore(
  inputs: ScoreInputs,
  mode: "mvp" | "growth" = "mvp",
  segment: SegmentType = "freelance"
): RevenueFitScore {
  // Clamp values between 0 and 10
  const clamp = (val: number) => Math.min(Math.max(val, 0), 10);

  const speed = clamp(inputs.speedToFirstRevenue);
  const reach = clamp(inputs.abilityToReachBuyers);
  const fit = clamp(inputs.founderFit);
  const urgency = clamp(inputs.painUrgency);
  const cost = clamp(inputs.lowStartupCost);
  const simplicity = clamp(inputs.executionSimplicity);
  const repeat = clamp(inputs.repeatRevenuePotential ?? 5);

  let weightedSum = 0;

  if (mode === "growth") {
    const weights = GROWTH_WEIGHTS[segment] || GROWTH_WEIGHTS.freelance;
    // Total score = (speed * w[0]) + (reach * w[1]) + (fit * w[2]) + (urgency * w[3]) + (simplicity * w[4]) + (repeat * w[5])
    weightedSum =
      speed * weights[0] +
      reach * weights[1] +
      fit * weights[2] +
      urgency * weights[3] +
      simplicity * weights[4] +
      repeat * weights[5];
  } else {
    const weights = MVP_WEIGHTS[segment] || MVP_WEIGHTS.freelance;
    // Total score = (speed * w[0]) + (reach * w[1]) + (fit * w[2]) + (urgency * w[3]) + (cost * w[4]) + (simplicity * w[5])
    weightedSum =
      speed * weights[0] +
      reach * weights[1] +
      fit * weights[2] +
      urgency * weights[3] +
      cost * weights[4] +
      simplicity * weights[5];
  }

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
