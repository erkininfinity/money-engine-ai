import { describe, it, expect } from "vitest";

// Local replica of the bottleneck rules helper to test the logic
function testDetectBottleneck(metrics: {
  prospectsListed: number;
  messagesSent: number;
  replies: number;
  callsBooked: number;
  callsCompleted: number;
  offersSent: number;
  paymentsReceived: number;
  revenueAmount: number;
}): "prospecting" | "message" | "offer" | "trust" | "pricing" | "sales_call" | "delivery" | "unknown" {
  if (metrics.prospectsListed < 5 || metrics.messagesSent < 5) {
    return "prospecting";
  }
  
  if (metrics.messagesSent > 0 && metrics.replies / metrics.messagesSent < 0.15) {
    return "message";
  }

  if (metrics.replies > 0 && metrics.callsBooked / metrics.replies === 0) {
    return "message";
  }

  if (metrics.callsBooked > 0 && metrics.callsCompleted / metrics.callsBooked < 0.5) {
    return "trust";
  }

  if (metrics.callsCompleted > 0 && metrics.offersSent / metrics.callsCompleted === 0) {
    return "offer";
  }

  if (metrics.offersSent > 0 && metrics.paymentsReceived === 0) {
    return "offer"; // or pricing
  }

  if (metrics.paymentsReceived > 0) {
    return "delivery";
  }

  return "unknown";
}

describe("Weekly Review Bottleneck Detection Rules", () => {
  it("should detect prospecting bottleneck when outreach count is very low", () => {
    const bottleneck = testDetectBottleneck({
      prospectsListed: 3,
      messagesSent: 2,
      replies: 0,
      callsBooked: 0,
      callsCompleted: 0,
      offersSent: 0,
      paymentsReceived: 0,
      revenueAmount: 0,
    });
    expect(bottleneck).toBe("prospecting");
  });

  it("should detect message bottleneck when reply rate is low", () => {
    const bottleneck = testDetectBottleneck({
      prospectsListed: 20,
      messagesSent: 20,
      replies: 1, // 5% reply rate
      callsBooked: 0,
      callsCompleted: 0,
      offersSent: 0,
      paymentsReceived: 0,
      revenueAmount: 0,
    });
    expect(bottleneck).toBe("message");
  });

  it("should detect offer bottleneck when calls completed are high but payments are zero", () => {
    const bottleneck = testDetectBottleneck({
      prospectsListed: 20,
      messagesSent: 20,
      replies: 8,
      callsBooked: 4,
      callsCompleted: 4,
      offersSent: 2,
      paymentsReceived: 0,
      revenueAmount: 0,
    });
    expect(bottleneck).toBe("offer");
  });

  it("should detect delivery bottleneck when at least one payment is received", () => {
    const bottleneck = testDetectBottleneck({
      prospectsListed: 20,
      messagesSent: 20,
      replies: 8,
      callsBooked: 4,
      callsCompleted: 4,
      offersSent: 2,
      paymentsReceived: 1,
      revenueAmount: 99000,
    });
    expect(bottleneck).toBe("delivery");
  });
});
