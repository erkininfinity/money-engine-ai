import { describe, it, expect } from "vitest";
import { calculateFitScore } from "../src/lib/scoring/fit-score";

describe("Segment-Specific Fit Score Calculation", () => {
  const baseInputs = {
    speedToFirstRevenue: 10,
    abilityToReachBuyers: 10,
    founderFit: 10,
    painUrgency: 10,
    lowStartupCost: 10,
    executionSimplicity: 10,
    repeatRevenuePotential: 10,
    whyThisScore: ["Segment test"],
    biggestRisk: "None",
    fastestValidationStep: "Test",
  };

  it("should calculate correct total score of 100 for all max values across different segments", () => {
    const segments: any[] = ["freelance", "microsaas", "career", "creator"];
    for (const seg of segments) {
      const scoreMvp = calculateFitScore(baseInputs, "mvp", seg);
      const scoreGrowth = calculateFitScore(baseInputs, "growth", seg);
      expect(scoreMvp.total).toBe(100);
      expect(scoreGrowth.total).toBe(100);
    }
  });

  it("should favor speed in freelance segment and urgency in microsaas segment in MVP mode", () => {
    // Freelance MVP: speed weight is 3.0, urgency weight is 1.5
    // MicroSaaS MVP: speed weight is 1.0, urgency weight is 3.0

    const highSpeedInputs = {
      ...baseInputs,
      speedToFirstRevenue: 10,
      abilityToReachBuyers: 5,
      founderFit: 5,
      painUrgency: 0,
      lowStartupCost: 5,
      executionSimplicity: 5,
    };

    const highUrgencyInputs = {
      ...baseInputs,
      speedToFirstRevenue: 0,
      abilityToReachBuyers: 5,
      founderFit: 5,
      painUrgency: 10,
      lowStartupCost: 5,
      executionSimplicity: 5,
    };

    // Freelance high speed:
    // speed * 3.0 + reach * 2.0 + fit * 1.5 + urgency * 1.5 + cost * 1.0 + simplicity * 1.0
    // 10 * 3.0 + 5 * 2.0 + 5 * 1.5 + 0 * 1.5 + 5 * 1.0 + 5 * 1.0 = 30 + 10 + 7.5 + 0 + 5 + 5 = 57.5 -> 58
    const freelanceHighSpeed = calculateFitScore(highSpeedInputs, "mvp", "freelance");
    expect(freelanceHighSpeed.total).toBe(58);

    // Freelance high urgency:
    // 0 * 3.0 + 5 * 2.0 + 5 * 1.5 + 10 * 1.5 + 5 * 1.0 + 5 * 1.0 = 0 + 10 + 7.5 + 15 + 5 + 5 = 42.5 -> 43
    const freelanceHighUrgency = calculateFitScore(highUrgencyInputs, "mvp", "freelance");
    expect(freelanceHighUrgency.total).toBe(43);

    expect(freelanceHighSpeed.total).toBeGreaterThan(freelanceHighUrgency.total);

    // MicroSaaS high speed:
    // speed * 1.0 + reach * 2.0 + fit * 2.0 + urgency * 3.0 + cost * 1.0 + simplicity * 1.0
    // 10 * 1.0 + 5 * 2.0 + 5 * 2.0 + 0 * 3.0 + 5 * 1.0 + 5 * 1.0 = 10 + 10 + 10 + 0 + 5 + 5 = 40
    const microsaasHighSpeed = calculateFitScore(highSpeedInputs, "mvp", "microsaas");
    expect(microsaasHighSpeed.total).toBe(40);

    // MicroSaaS high urgency:
    // 0 * 1.0 + 5 * 2.0 + 5 * 2.0 + 10 * 3.0 + 5 * 1.0 + 5 * 1.0 = 0 + 10 + 10 + 30 + 5 + 5 = 60
    const microsaasHighUrgency = calculateFitScore(highUrgencyInputs, "mvp", "microsaas");
    expect(microsaasHighUrgency.total).toBe(60);

    expect(microsaasHighUrgency.total).toBeGreaterThan(microsaasHighSpeed.total);
  });
});
