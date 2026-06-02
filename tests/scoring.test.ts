import { describe, it, expect } from "vitest";
import { calculateFitScore } from "../src/lib/scoring/fit-score";

describe("Revenue Fit Score Calculation", () => {
  it("should calculate correct weighted score for maximum values (all 10)", () => {
    const score = calculateFitScore({
      speedToFirstRevenue: 10,
      abilityToReachBuyers: 10,
      founderFit: 10,
      painUrgency: 10,
      lowStartupCost: 10,
      executionSimplicity: 10,
      whyThisScore: ["Max score test"],
      biggestRisk: "None",
      fastestValidationStep: "Test",
    });

    expect(score.total).toBe(100);
    expect(score.speedToFirstRevenue).toBe(10);
    expect(score.lowStartupCost).toBe(10);
  });

  it("should calculate correct weighted score for minimum values (all 0)", () => {
    const score = calculateFitScore({
      speedToFirstRevenue: 0,
      abilityToReachBuyers: 0,
      founderFit: 0,
      painUrgency: 0,
      lowStartupCost: 0,
      executionSimplicity: 0,
      whyThisScore: ["Min score test"],
      biggestRisk: "High risk",
      fastestValidationStep: "Test",
    });

    expect(score.total).toBe(0);
  });

  it("should calculate correct weighted score for balanced average values (all 5)", () => {
    const score = calculateFitScore({
      speedToFirstRevenue: 5,
      abilityToReachBuyers: 5,
      founderFit: 5,
      painUrgency: 5,
      lowStartupCost: 5,
      executionSimplicity: 5,
      whyThisScore: ["Average score test"],
      biggestRisk: "Some risks",
      fastestValidationStep: "Test",
    });

    // 5 * 2.5 + 5 * 2 + 5 * 2 + 5 * 1.5 + 5 * 1 + 5 * 1 = 12.5 + 10 + 10 + 7.5 + 5 + 5 = 50
    expect(score.total).toBe(50);
  });

  it("should clamp values outside 0-10 range", () => {
    const score = calculateFitScore({
      speedToFirstRevenue: 15, // should clamp to 10
      abilityToReachBuyers: -5, // should clamp to 0
      founderFit: 5,
      painUrgency: 5,
      lowStartupCost: 5,
      executionSimplicity: 5,
      whyThisScore: ["Clamp score test"],
      biggestRisk: "Some risks",
      fastestValidationStep: "Test",
    });

    // clamped speed: 10 * 3 = 30
    // clamped reach: 0 * 2 = 0
    // fit: 5 * 1.5 = 7.5
    // urgency: 5 * 1.5 = 7.5
    // cost: 5 * 1 = 5
    // simplicity: 5 * 1 = 5
    // Sum = 30 + 0 + 7.5 + 7.5 + 5 + 5 = 55
    expect(score.total).toBe(55);
    expect(score.speedToFirstRevenue).toBe(10);
    expect(score.abilityToReachBuyers).toBe(0);
  });

  it("should apply correct weights to categories", () => {
    // Test that speedToFirstRevenue (weight 30%) affects score more than executionSimplicity (weight 10%)
    const scoreHighSpeed = calculateFitScore({
      speedToFirstRevenue: 10,
      abilityToReachBuyers: 5,
      founderFit: 5,
      painUrgency: 5,
      lowStartupCost: 5,
      executionSimplicity: 0,
      whyThisScore: ["High speed test"],
      biggestRisk: "Some risks",
      fastestValidationStep: "Test",
    });

    const scoreHighSimplicity = calculateFitScore({
      speedToFirstRevenue: 0,
      abilityToReachBuyers: 5,
      founderFit: 5,
      painUrgency: 5,
      lowStartupCost: 5,
      executionSimplicity: 10,
      whyThisScore: ["High simplicity test"],
      biggestRisk: "Some risks",
      fastestValidationStep: "Test",
    });

    // scoreHighSpeed: 10 * 3.0 + 5 * 2 + 5 * 1.5 + 5 * 1.5 + 5 * 1 + 0 * 1 = 30 + 10 + 7.5 + 7.5 + 5 + 0 = 60
    // scoreHighSimplicity: 0 * 3.0 + 5 * 2 + 5 * 1.5 + 5 * 1.5 + 5 * 1 + 10 * 1 = 0 + 10 + 7.5 + 7.5 + 5 + 10 = 40
    expect(scoreHighSpeed.total).toBe(60);
    expect(scoreHighSimplicity.total).toBe(40);
    expect(scoreHighSpeed.total).toBeGreaterThan(scoreHighSimplicity.total);
  });
});
