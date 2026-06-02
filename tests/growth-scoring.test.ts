import { describe, it, expect } from "vitest";
import { calculateFitScore } from "../src/lib/scoring/fit-score";

describe("Revenue Fit Score Calculation in Growth Mode", () => {
  it("should calculate correct weighted score for maximum values in growth mode (all 10)", () => {
    const score = calculateFitScore({
      speedToFirstRevenue: 10,
      abilityToReachBuyers: 10,
      founderFit: 10,
      painUrgency: 10,
      lowStartupCost: 10,
      executionSimplicity: 10,
      repeatRevenuePotential: 10,
      whyThisScore: ["Max growth score test"],
      biggestRisk: "None",
      fastestValidationStep: "Test",
    }, "growth");

    expect(score.total).toBe(100);
    expect(score.speedToFirstRevenue).toBe(10);
    expect(score.repeatRevenuePotential).toBe(10);
  });

  it("should apply correct weights in growth mode", () => {
    // In growth mode, abilityToReachBuyers has weight 2.5 (25%) and repeatRevenuePotential has weight 2.0 (20%)
    // speedToFirstRevenue has weight 1.0 (10%)
    const inputsBase = {
      founderFit: 5,
      painUrgency: 5,
      lowStartupCost: 5,
      executionSimplicity: 5,
      whyThisScore: ["Growth weights test"],
      biggestRisk: "Some risks",
      fastestValidationStep: "Test",
    };

    const scoreHighReach = calculateFitScore({
      ...inputsBase,
      speedToFirstRevenue: 0,
      abilityToReachBuyers: 10,
      repeatRevenuePotential: 0,
    }, "growth");

    const scoreHighSpeed = calculateFitScore({
      ...inputsBase,
      speedToFirstRevenue: 10,
      abilityToReachBuyers: 0,
      repeatRevenuePotential: 0,
    }, "growth");

    const scoreHighRepeat = calculateFitScore({
      ...inputsBase,
      speedToFirstRevenue: 0,
      abilityToReachBuyers: 0,
      repeatRevenuePotential: 10,
    }, "growth");

    // base components for all three:
    // founderFit: 5 * 1.5 = 7.5
    // painUrgency: 5 * 1.5 = 7.5
    // executionSimplicity: 5 * 1.5 = 7.5
    // base sum = 22.5

    // scoreHighReach: base + 10 * 2.5 = 22.5 + 25 = 47.5 -> 48
    // scoreHighSpeed: base + 10 * 1.0 = 22.5 + 10 = 32.5 -> 33
    // scoreHighRepeat: base + 10 * 2.0 = 22.5 + 20 = 42.5 -> 43

    expect(scoreHighReach.total).toBe(48);
    expect(scoreHighSpeed.total).toBe(33);
    expect(scoreHighRepeat.total).toBe(43);

    expect(scoreHighReach.total).toBeGreaterThan(scoreHighRepeat.total);
    expect(scoreHighRepeat.total).toBeGreaterThan(scoreHighSpeed.total);
  });
});
